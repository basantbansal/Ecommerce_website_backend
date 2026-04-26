import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const storeProducts = asyncHandler(async (req, res) => {
    if (req.user.role !== "seller") {
        throw new ApiError(403, "Only sellers can add products")
    }

    const { title, description, price, category, brand, stock, sku } = req.body

    if ([title, price, category].some((field) => String(field || "").trim() === "")) {
        throw new ApiError(400, "Title, price and category are required")
    }

    const imageLocalPath = req.files?.image?.[0]?.path

    if (!imageLocalPath) {
        throw new ApiError(400, "Product image is required")
    }

    const image = await uploadOnCloudinary(imageLocalPath)

    if (!image) {
        throw new ApiError(400, "Product image upload failed")
    }

    const product = await Product.create({
        title,
        description,
        price,
        category,
        brand,
        stock,
        sku: sku || `SELLER-${Date.now()}`,
        thumbnail: image.url,
        images: [image.url],
        user: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"))
})

const importDummyProducts = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can import products")
    }

    const response = await axios.get("https://dummyjson.com/products")
    const dummyProducts = response.data?.products || []
    const createdProducts = []

    for (const dummyProduct of dummyProducts) {
        const sku = dummyProduct.sku || `DUMMY-${dummyProduct.id}`
        const existingProduct = await Product.findOne({ sku })

        if (!existingProduct) {
            const product = await Product.create({
                title: dummyProduct.title,
                description: dummyProduct.description,
                category: dummyProduct.category,
                brand: dummyProduct.brand,
                price: dummyProduct.price,
                discountPercentage: dummyProduct.discountPercentage,
                rating: dummyProduct.rating,
                stock: dummyProduct.stock,
                minimumOrderQuantity: dummyProduct.minimumOrderQuantity,
                thumbnail: dummyProduct.thumbnail,
                images: dummyProduct.images,
                dimensions: dummyProduct.dimensions,
                weight: dummyProduct.weight,
                shippingInformation: dummyProduct.shippingInformation,
                returnPolicy: dummyProduct.returnPolicy,
                warrantyInformation: dummyProduct.warrantyInformation,
                tags: dummyProduct.tags,
                sku,
                reviews: dummyProduct.reviews,
                meta: dummyProduct.meta,
                user: req.user._id
            })

            createdProducts.push(product)
        }
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createdProducts, "Dummy products imported successfully"))
})

const getProducts = asyncHandler(async (_, res) => {
    const products = await Product.find().sort({ createdAt: -1 })

    return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"))
})

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"))
})

export { storeProducts, getProducts, getProductById, importDummyProducts }
