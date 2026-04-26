import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

// about multer , uploadOnCloudinart ->
// Client → Multer (route) → saves to temp/ → controller gets local path → uploadOnCloudinary → Cloudinary → URL saved to DB

const getCookieOptions = () => ({ // 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
})

const generateAccessAndRefereshTokens = async(userId) =>{ // this function is responsible for generating both access and refresh tokens for a user. It takes the user's ID as an argument, retrieves the user from the database, generates an access token and a refresh token using the methods defined in the user model, and then saves the refresh token in the user's document in the database. Finally, it returns an object containing both the access token and the refresh token. This function is typically used during the login process to provide the client with the necessary tokens for authentication and session management.
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) // this line is saving the updated user document to the database with the new refresh token. The option { validateBeforeSave: false } is used to skip any validation checks that might be defined in the user schema before saving the document. This can be useful in cases where you want to update a specific field (like refreshToken) without triggering validation for other fields that may not be relevant to this update operation. By setting validateBeforeSave to false, you ensure that only the refreshToken field is updated without any interference from other validation rules that might be present in the user model.

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json( // this line is sending a JSON response back to the client with a status code of 201 (Created) and a body that contains an instance of ApiResponse. The ApiResponse object is constructed with a status code of 200, the created user data (excluding the password and refresh token), and a success message indicating that the user was registered successfully. This response structure provides a standardized format for API responses, making it easier for clients to handle and interpret the results of their requests.
        new ApiResponse(201, createdUser, "User registered Successfully") // here status is 200 and above is 201 its different because 201 is used when a new resource is created successfully, while 200 is a general success status code that can be used for various successful operations. In this case, since we are creating a new user, it would be more appropriate to use 201 to indicate that a new resource (user) has been created successfully. However, the choice of status code can depend on the specific API design and conventions being followed.
    ) 
})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password, loginId} = req.body
    const identifier = (loginId || email || username || "").trim().toLowerCase()

    if (!identifier) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username: identifier}, {email: identifier}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = getCookieOptions() // these options are used to configure the cookies that will be sent back to the client. The httpOnly option is set to true, which means that the cookies cannot be accessed or modified by client-side JavaScript, providing an additional layer of security against cross-site scripting (XSS) attacks. The secure option is also set to true, which means that the cookies will only be sent over HTTPS connections, ensuring that the tokens are transmitted securely and reducing the risk of interception by malicious actors. These options help to enhance the security of the authentication tokens stored in the cookies.

    return res
    .status(200) // simple meaning of cookie is that it is a small piece of data that the server sends to the client's web browser, which then stores it and sends it back with subsequent requests to the same server. In this context, the cookie is being used to store the access token and refresh token generated for the user upon successful login. By setting these tokens in cookies, the server can maintain the user's authenticated session across multiple requests without requiring the client to include the tokens in the request headers manually. The options provided ensure that these cookies are secure and not accessible via client-side scripts, enhancing the overall security of the authentication mechanism. these cookies are stored at client side's browser's cookie storage , and what if someone hacks this cookie? then they can easily get access to user's account, so to prevent this we have set httpOnly to true and secure to true, which means that these cookies cannot be accessed or modified by client-side JavaScript and will only be sent over HTTPS connections, providing an additional layer of security against potential attacks.can we see the cookie storage in browser? yes we can see the cookie storage in browser's developer tools, under the "Application" tab (in Chrome) or "Storage" tab (in Firefox). There, you can find a section for "Cookies" where you can view all the cookies stored by the website, including their names, values, expiration dates, and other attributes. However, if the cookies are set with the httpOnly flag, they will not be accessible via client-side JavaScript and will not be visible in the "Cookies" section of the developer tools. This is a security measure to prevent malicious scripts from accessing sensitive information stored in cookies.
    .cookie("accessToken", accessToken, options) // this line is setting a cookie named "accessToken" with the value of the access token generated for the user. The options object is passed as the third argument to configure the cookie's properties, such as making it HTTP-only and secure. This allows the client to store the access token in a cookie, which can be used for subsequent authenticated requests to the server.
    .cookie("refreshToken", refreshToken, options) // this line is setting another cookie named "refreshToken" with the value of the refresh token generated for the user. Similar to the access token cookie, it also uses the options object to configure the cookie's properties, ensuring that it is HTTP-only and secure. This allows the client to store the refresh token in a cookie, which can be used to obtain a new access token when the current access token expires, providing a seamless authentication experience for the user.
    .json(
        new ApiResponse( // in this data is user that we are sending back to client and message is user logged in successfully
            200, 
            {
                user: loggedInUser, accessToken, refreshToken // this is the data that will be sent back to the client in the response body. It includes the logged-in user's information (excluding sensitive fields like password and refresh token), as well as the access token and refresh token that were generated for the user. This allows the client to have access to the necessary information and tokens for managing the user's session and making authenticated requests to the server.
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = getCookieOptions()

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken // this line is trying to retrieve the refresh token from the incoming request. It first checks if the refresh token is present in the cookies (specifically in a cookie named "refreshToken"). If it is not found in the cookies, it then looks for the refresh token in the request body (req.body.refreshToken). This allows the server to support both cookie-based and body-based methods for receiving the refresh token from the client when requesting a new access token.

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify( // this line is verifying the incoming refresh token using the jwt.verify method. It takes the incoming refresh token and the secret key (REFRESH_TOKEN_SECRET) used to sign the refresh token as arguments. If the refresh token is valid and has not expired, it will return the decoded payload of the token, which typically contains user information such as user ID. If the refresh token is invalid or has expired, it will throw an error, which is caught in the catch block below. This verification step is crucial to ensure that the refresh token being used to request a new access token is legitimate and has not been tampered with, providing an additional layer of security in the token refresh process.    
            incomingRefreshToken, // jwt.verify  is also used at other places in code like in auth middleware to verify access token, but here we are using it to verify refresh token, and the secret key used for signing the refresh token is different from the one used for signing the access token, which is why we are using process.env.REFRESH_TOKEN_SECRET here instead of process.env.ACCESS_TOKEN_SECRET. This ensures that the verification process is specific to the type of token being verified, providing an additional layer of security and preventing potential misuse of tokens.
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = getCookieOptions()

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const becomeSeller = asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                role: "seller"
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!updatedUser) {
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Seller access enabled successfully"))
})

export { becomeSeller, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser }
