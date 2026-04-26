import { Router } from "express";
import { createOrder, getOrders } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/").get(getOrders).post(createOrder)

export default router
