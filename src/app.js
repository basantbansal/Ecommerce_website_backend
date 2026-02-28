import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true // 
}))

app.use(cookieParser())
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

//route import 
import userRoute from "./routes/user.route.js"

// routes declaration
app.use("/api/v1/users", userRoute)

export { app }

/* Defines how your express app behaves.
1. Sets up CORS (allows your React frontend to talk to this backend)
2. Sets up JSON parsing (so req.body works)
3. Sets up urlencoded (so form data works)
4. Sets up static files (public folder accessible)
5. Registers all routes
 */