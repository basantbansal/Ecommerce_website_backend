import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],
        total: {
            type: Number,
            required: true
        },
        payment: {
            type: Schema.Types.ObjectId,
            ref: "Payment"
        },
        source: {
            type: String,
            enum: ["cart", "buy_now"],
            default: "cart"
        },
        status: {
            type: String,
            enum: ["pending_payment", "paid", "payment_failed", "cancelled"],
            default: "pending_payment"
        }
    },
    {
        timestamps: true
    }
)

export const Order = mongoose.model("Order", orderSchema)
