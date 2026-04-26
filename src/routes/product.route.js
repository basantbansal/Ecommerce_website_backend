import {Router} from "express"
import {upload} from "../middlewares/multer.middleware.js"
import {storeProducts, getProducts, getProductById, importDummyProducts} from "../controllers/product.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/").get(getProducts)

router.route("/store-products").post(
    verifyJWT,
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]),
    storeProducts
    )

router.route("/import-dummy-products").post(verifyJWT, importDummyProducts)

router.route("/:productId").get(getProductById)

export default router
