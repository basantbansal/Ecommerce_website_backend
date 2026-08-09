import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Cart } from "../models/cart.models.js";
import { Order } from "../models/order.models.js";
import { Payment } from "../models/payment.models.js";
import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(500, "Razorpay keys are not configured")
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
}

const completePaidOrder = async (payment, order) => {
    if (payment.status === "succeeded" && order.status === "paid") {
        return await Order.findById(order._id)
        .populate("items.product")
        .populate("payment")
    }

    if (payment.status !== "pending" || order.status !== "pending_payment") {
        throw new ApiError(400, "Payment cannot be confirmed")
    }

    for (const item of order.items) {
        if (!item.product) {
            throw new ApiError(404, "Product not found")
        }

        if (item.product.stock < item.quantity) {
            payment.status = "failed"
            payment.failureReason = `${item.product.title} has only ${item.product.stock} item(s) in stock`
            order.status = "payment_failed"
            await payment.save()
            await order.save()

            throw new ApiError(400, payment.failureReason)
        }
    }

    for (const item of order.items) {
        const updatedProduct = await Product.findOneAndUpdate(
            {
                _id: item.product._id,
                stock: { $gte: item.quantity }
            },
            {
                $inc: { stock: -item.quantity }
            },
            {
                new: true
            }
        )

        if (!updatedProduct) {
            payment.status = "failed"
            payment.failureReason = `${item.product.title} does not have enough stock now`
            order.status = "payment_failed"
            await payment.save()
            await order.save()

            throw new ApiError(400, payment.failureReason)
        }

        updatedProduct.availabilityStatus = updatedProduct.stock > 0 ? "In Stock" : "Out of Stock"
        await updatedProduct.save()
    }

    payment.status = "succeeded"
    await payment.save()

    order.status = "paid"
    await order.save()

    if (order.source === "cart") {
        const cart = await Cart.findOne({ user: order.user })

        if (cart) {
            cart.items = []
            await cart.save()
        }
    }

    return await Order.findById(order._id)
    .populate("items.product")
    .populate("payment")
}

const confirmPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params

    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
        throw new ApiError(400, "Valid payment id is required")
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        user: req.user._id
    })

    if (!payment) {
        throw new ApiError(404, "Payment not found")
    }

    let order = await Order.findOne({
        _id: payment.order,
        user: req.user._id
    }).populate("items.product")

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    payment.providerPaymentId = `fake_${Date.now()}_${payment._id}`
    const paidOrder = await completePaidOrder(payment, order)

    return res
    .status(200)
    .json(new ApiResponse(200, paidOrder, "Payment confirmed successfully"))
})

const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { paymentId } = req.params

    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
        throw new ApiError(400, "Valid payment id is required")
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        user: req.user._id
    })

    if (!payment) {
        throw new ApiError(404, "Payment not found")
    }

    if (payment.status !== "pending") {
        throw new ApiError(400, "Payment cannot be started")
    }

    const order = await Order.findOne({
        _id: payment.order,
        user: req.user._id,
        status: "pending_payment"
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (!payment.providerOrderId) {
        const razorpay = getRazorpayInstance()
        const razorpayOrder = await razorpay.orders.create({ // here razorpay create works even when razorpay is not in mongoDB because ? because it creates order in razorpay system and gives us order id, and we are saving that order id in our database, so even if razorpay is not in our database, it will work because it is working with razorpay system, and we are just saving the order id in our database for future reference, so that when payment is successful we can verify the payment with that order id
            amount: Math.round(payment.amount * 100),
            currency: "INR",
            receipt: `order_${order._id.toString().slice(-24)}`,
            notes: {
                orderId: order._id.toString(),
                paymentId: payment._id.toString()
            }
        })

        payment.provider = "razorpay"
        payment.currency = "INR"
        payment.providerOrderId = razorpayOrder.id
        await payment.save()
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            keyId: process.env.RAZORPAY_KEY_ID,
            amount: Math.round(payment.amount * 100),
            currency: payment.currency,
            name: "Amazing Store",
            description: `Order ${order._id}`,
            razorpayOrderId: payment.providerOrderId,
            paymentId: payment._id
        },
        "Razorpay order created successfully"
    ))
})

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
        throw new ApiError(400, "Valid payment id is required")
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "Razorpay payment details are required")
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        user: req.user._id
    })

    if (!payment) {
        throw new ApiError(404, "Payment not found")
    }

    if (payment.providerOrderId !== razorpay_order_id) {
        throw new ApiError(400, "Razorpay order id does not match")
    }

    let order = await Order.findOne({
        _id: payment.order,
        user: req.user._id
    }).populate("items.product")

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${payment.providerOrderId}|${razorpay_payment_id}`)
    .digest("hex")

    if (generatedSignature !== razorpay_signature) {
        payment.status = "failed"
        payment.failureReason = "Razorpay signature verification failed"
        order.status = "payment_failed"
        await payment.save()
        await order.save()

        throw new ApiError(400, "Payment verification failed")
    }

    payment.provider = "razorpay"
    payment.providerPaymentId = razorpay_payment_id
    payment.providerSignature = razorpay_signature

    const paidOrder = await completePaidOrder(payment, order)

    return res
    .status(200)
    .json(new ApiResponse(200, paidOrder, "Razorpay payment verified successfully"))
})

export { confirmPayment, createRazorpayOrder, verifyRazorpayPayment }
