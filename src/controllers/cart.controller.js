import mongoose from "mongoose";
import { Cart } from "../models/cart.models.js";
import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateCart = (cart) => {
    return cart.populate("items.product")
}

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: []
        })
    }

    return cart
}

const getCart = asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id)
    await populateCart(cart)

    return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"))
})

const addItemToCart = asyncHandler(async (req, res) => {
    const { productId } = req.body

    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Valid product id is required")
    }

    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const cart = await getOrCreateCart(req.user._id)
    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    )

    if (!existingItem) {
        cart.items.push({
            product: productId,
            quantity: 1
        })

        await cart.save()
    }

    await populateCart(cart)

    return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item added to cart"))
})

const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const { change } = req.body

    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Valid product id is required")
    }

    if (![1, -1].includes(Number(change))) {
        throw new ApiError(400, "Change must be 1 or -1")
    }

    const cart = await getOrCreateCart(req.user._id)
    const item = cart.items.find(
        (cartItem) => cartItem.product.toString() === productId
    )

    if (!item) {
        throw new ApiError(404, "Item not found in cart")
    }

    item.quantity += Number(change)

    if (item.quantity <= 0) {
        cart.items = cart.items.filter(
            (cartItem) => cartItem.product.toString() !== productId
        )
    }

    await cart.save()
    await populateCart(cart)

    return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart updated successfully"))
})

const removeCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params

    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Valid product id is required")
    }

    const cart = await getOrCreateCart(req.user._id)
    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    )

    await cart.save()
    await populateCart(cart)

    return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item removed from cart"))
})

const clearCart = asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id)
    cart.items = []

    await cart.save()

    return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"))
})

export { getCart, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart }
