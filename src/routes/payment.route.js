import { Router } from "express";
import {
    confirmPayment,
    createRazorpayOrder,
    verifyRazorpayPayment
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/:paymentId/confirm").post(confirmPayment)
router.route("/:paymentId/razorpay-order").post(createRazorpayOrder)
router.route("/:paymentId/razorpay-verify").post(verifyRazorpayPayment)

export default router
