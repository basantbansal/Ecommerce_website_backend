import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req, _, next) => { // this middleware is used to verify the JWT token sent by the client in the request. It checks if the token is present, verifies its validity, and if valid, it retrieves the user associated with the token and attaches it to the request object for further use in the route handlers. If the token is missing or invalid, it throws an ApiError with a 401 status code indicating an unauthorized request.
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // this line is trying to retrieve the JWT token from the incoming request. It first checks if the token is present in the cookies (specifically in a cookie named "accessToken"). If it is not found in the cookies, it then looks for the token in the Authorization header of the request. The expected format of the Authorization header is "Bearer <token>", so it uses the replace method to remove the "Bearer " prefix and extract just the token value. This allows the middleware to support both cookie-based and header-based authentication methods for retrieving the JWT token from the client request.
        
        // console.log(token);
        console.log("cookies:", req.cookies)  // add this
        console.log("token:", token)           // add this
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // this line is verifying the JWT token using the jwt.verify method. It takes the token retrieved from the request and the secret key (ACCESS_TOKEN_SECRET) used to sign the token as arguments. If the token is valid and has not expired, it will return the decoded payload of the token, which typically contains user information such as user ID, email, etc. If the token is invalid or has expired, it will throw an error, which is caught in the catch block below.
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") // this line is querying the database to find a user by their ID, which is extracted from the decoded JWT token. The findById method is used to search for a user document in the User collection based on the provided ID. The select method is then used to exclude the password and refreshToken fields from the returned user object for security reasons, ensuring that sensitive information is not exposed in the request handling process.
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token") 
        }
    
        req.user = user; // if the user is found and the token is valid, this line attaches the user object to the request object (req.user) so that it can be accessed in subsequent middleware functions or route handlers. This allows the application to have access to the authenticated user's information throughout the request processing pipeline.
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})