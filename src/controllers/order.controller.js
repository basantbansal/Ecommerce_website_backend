import mongoose from "mongoose";
import { Cart } from "../models/cart.models.js";
import { Order } from "../models/order.models.js";
import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 })

    return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"))
})

const createOrder = asyncHandler(async (req, res) => {
    const requestedItems = req.body?.items || []
    let orderItems = []
    let cart = null

    if (requestedItems.length > 0) {
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

            orderItems.push({
                product: product._id,
                quantity: Number(item.quantity || 1),
                price: product.price
            })
        }
    } else {
        cart = await Cart.findOne({ user: req.user._id }).populate("items.product")

        if (!cart || cart.items.length === 0) {
            throw new ApiError(400, "Cart is empty")
        }

        orderItems = cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }))
    }

    const total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    )

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        total,
        status: "placed"
    })

    if (cart) {
        cart.items = []
        await cart.save()
    }

    const createdOrder = await Order.findById(order._id).populate("items.product")

    return res
    .status(201)
    .json(new ApiResponse(201, createdOrder, "Order created successfully"))
})

export { getOrders, createOrder }
