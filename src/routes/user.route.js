import {Router} from "express"
import { becomeSeller, getCurrentUser, registerUser,loginUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([ // multer sends this to temp public folder instead of directly to cloudinary because we need to get the local path of the file to upload it to cloudinary. So multer saves the file to a temp location and then we use that local path to upload the file to cloudinary in the controller.
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
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/become-seller").post(verifyJWT, becomeSeller)

export default router
