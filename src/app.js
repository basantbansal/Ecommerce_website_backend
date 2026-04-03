import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://e-commerce-website-ten-dusky.vercel.app"
  ],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/products", async (req, res) => {
  try {
    const response = await axios.get("https://dummyjson.com/products");
    res.json(response.data.products);
  } catch (error) {
    console.error("Products route error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch products",
      message: error.message
    });
  }
});

// route import
import userRoute from "./routes/user.route.js";

// routes declaration
app.use("/api/v1/users", userRoute);

export { app };