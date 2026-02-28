import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function () { // whenever someone edits 
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})

// methods are written here and not in controller because these are the functions that are directly related to the user model and can be reused in multiple places in the application. For example, the isPasswordCorrect method can be used in both the login controller and any other place where we need to verify a user's password. Similarly, the generateAccessToken and generateRefreshToken methods can be used whenever we need to generate tokens for a user, such as during login or token refresh operations. By defining these methods in the user model, we promote code reusability and maintain a clear separation of concerns between the data model and the business logic in the controllers.

userSchema.methods.isPasswordCorrect = async function(password){ // compare the provided password with the hashed password stored in the database 
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign( // this line is generating a JWT access token for the user. It takes the user's ID, email, username, and full name as the payload of the token, and signs it using the secret key defined in the environment variable ACCESS_TOKEN_SECRET. The token is set to expire based on the value defined in ACCESS_TOKEN_EXPIRY. This access token can then be used for authenticating subsequent requests made by the user to protected routes in the application.
        { 
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign( //
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)

// models meaning that it defines the structure of the data that will be stored in the database. It specifies the fields, their types, and any validation rules or constraints. In this case, the user model defines fields such as username, email, fullName, avatar, coverImage, watchHistory, password, and refreshToken. It also includes methods for hashing passwords, comparing passwords, and generating access and refresh tokens for authentication purposes.

// it can also communicate with the database to perform operations such as creating, reading, updating, and deleting user records. The model serves as a blueprint for how user data is structured and how it can be manipulated within the application.