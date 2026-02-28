import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path:"./.env"
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

/*
    First file that runs.
1. Loads .env (so process.env variables work)
2. Connects to MongoDB
3. If DB connects successfully → starts express server on PORT 8000
4. If DB fails → logs error
*/