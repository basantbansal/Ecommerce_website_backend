import mongoose from "mongoose";
import { Cart } from "../models/cart.models.js";
import { IdempotencyKey } from "../models/idempotency.models.js";
import { Order } from "../models/order.models.js";
import { Payment } from "../models/payment.models.js";
import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        user: req.user._id,
        status: { $in: ["paid", "placed"] }
    })
    .populate("items.product")
    .populate("payment")
    .sort({ createdAt: -1 })

    return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"))
})

const createOrder = asyncHandler(async (req, res) => {
    const idempotencyKey = req.header("Idempotency-Key")
    let idempotencyRecord = null

    if (idempotencyKey) {
        const existingKey = await IdempotencyKey.findOne({
            user: req.user._id,
            key: idempotencyKey
        })

        if (existingKey?.status === "completed" && existingKey.order) {
            const existingOrder = await Order.findById(existingKey.order)
            .populate("items.product")
            .populate("payment")

            return res
            .status(200)
            .json(new ApiResponse(
                200,
                {
                    order: existingOrder,
                    payment: existingOrder.payment
                },
                "Checkout already created for this request"
            ))
        }

        if (existingKey?.status === "processing") {
            throw new ApiError(409, "This order request is already processing")
        }

        try {
            idempotencyRecord = await IdempotencyKey.create({
                user: req.user._id,
                key: idempotencyKey
            })
        } catch (error) {
            if (error.code === 11000) {
                throw new ApiError(409, "This order request is already processing")
            }

            throw error
        }
    }

    const requestedItems = req.body?.items || [] 
    let orderItems = []
    let source = "buy_now"

    try {
        if (requestedItems.length > 0) { // we dont need it because we are taking items from cart on backend, so there is no need to pass items from frontend, but still if we want to implement buy now feature in future then we can use this code, so i am keeping it here for future reference, and also it is not causing any harm, so i am not deleting it
            for (const item of requestedItems) {
                if (!item.productId || !mongoose.isValidObjectId(item.productId)) {
                    throw new ApiError(400, "Valid product id is required")
                }

                if (Number(item.quantity || 1) < 1) {
                    throw new ApiError(400, "Quantity must be at least 1")
                }

                const product = await Product.findById(item.productId)

                if (!product) {
                    throw new ApiError(404, "Product not found")
                }

                const quantity = Number(item.quantity || 1)

                if (product.stock < quantity) {
                    throw new ApiError(400, `${product.title} has only ${product.stock} item(s) in stock`)
                }

                orderItems.push({
                    product: product._id,
                    quantity,
                    price: product.price
                })
            }
        } else {
            source = "cart"
            const cart = await Cart.findOne({ user: req.user._id }).populate("items.product")

            if (!cart || cart.items.length === 0) {
                throw new ApiError(400, "Cart is empty")
            }

            for (const item of cart.items) {
                if (item.product.stock < item.quantity) {
                    throw new ApiError(400, `${item.product.title} has only ${item.product.stock} item(s) in stock`)
                }

                orderItems.push({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                })

            }
        }

        const total = orderItems.reduce( // here 
            (sum, item) => sum + item.price * item.quantity,
            0
        )

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            total,
            source,
            status: "pending_payment"
        })

        const payment = await Payment.create({ 
            user: req.user._id,
            order: order._id,
            amount: total,
            currency: "USD",
            provider: "fake",
            status: "pending"
        })

        order.payment = payment._id
        await order.save() // it is saved in database ? yes, because we are awaiting it and there is no error, so it means it is saved in database

        const createdOrder = await Order.findById(order._id) // here we are fetching order again just to populate product and payment details, because we need to send them in response, so instead of sending order and payment separately, we are populating payment details in order itself and sending only order in response, so that in frontend we can get both order and payment details from single response
        .populate("items.product")
        .populate("payment")

        if (idempotencyRecord) { 
            idempotencyRecord.order = createdOrder._id
            idempotencyRecord.status = "completed"
            await idempotencyRecord.save()
        }

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {
                order: createdOrder,
                payment
            },
            "Checkout created successfully"
        ))
    } catch (error) {
        if (idempotencyRecord) {
            await IdempotencyKey.deleteOne({ _id: idempotencyRecord._id })
        }

        throw error
    }
})

export { getOrders, createOrder }
