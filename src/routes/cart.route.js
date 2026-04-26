import { Router } from "express";
import {
    addItemToCart,
    clearCart,
    getCart,
    removeCartItem,
    updateCartItemQuantity
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/").get(getCart).delete(clearCart)
router.route("/items").post(addItemToCart)
router.route("/items/:productId").patch(updateCartItemQuantity).delete(removeCartItem)

export default router
