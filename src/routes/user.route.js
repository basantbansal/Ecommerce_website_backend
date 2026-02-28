import {Router} from "express"
import { registerUser,loginUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes because they require the user to be logged in (access token) in simple terms they require the user to be authenticated. So we use the verifyJWT middleware to check if the user is authenticated before allowing them to access these routes.
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken) // 

export default router