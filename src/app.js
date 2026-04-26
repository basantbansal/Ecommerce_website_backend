import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://e-commerce-website-ten-dusky.vercel.app",
  "https://e-commerce-website-9jgzblrxv-basantbansals-projects.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// route import

// routes declaration
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);

app.use((err, _, res, __) => {
  const statusCode = err?.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err?.message || "Internal Server Error",
    errors: err?.errors || [],
  });
});

export { app };
