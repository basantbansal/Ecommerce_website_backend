import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "USD"
        },
        provider: {
            type: String,
            enum: ["fake", "stripe", "razorpay", "paypal"],
            default: "fake"
        },
        providerPaymentId: {
            type: String
        },
        providerOrderId: {
            type: String
        },
        providerSignature: {
            type: String
        },
        status: {
            type: String,
            enum: ["pending", "succeeded", "failed", "refunded"],
            default: "pending"
        },
        failureReason: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

paymentSchema.index({ user: 1, order: 1 })

export const Payment = mongoose.model("Payment", paymentSchema)
