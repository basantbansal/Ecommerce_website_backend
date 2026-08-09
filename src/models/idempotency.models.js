import mongoose, { Schema } from "mongoose";

const idempotencySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        key: {
            type: String,
            required: true,
            trim: true
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order"
        },
        status: {
            type: String,
            enum: ["processing", "completed"],
            default: "processing"
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    },
    {
        timestamps: true
    }
)

idempotencySchema.index({ user: 1, key: 1 }, { unique: true })
idempotencySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const IdempotencyKey = mongoose.model("IdempotencyKey", idempotencySchema)
