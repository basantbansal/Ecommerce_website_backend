import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./add.js"

dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Error connecting to database",err)
})