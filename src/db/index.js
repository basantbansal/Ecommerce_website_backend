import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const mongoUris = [process.env.MONGODB_URI, process.env.MONGO_URL]
      .filter(Boolean)
      .map((uri) => uri.trim().replace(/^["']|["']$/g, ""));

    const mongoUri = mongoUris.find(
      (uri) => uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")
    );

    if (!mongoUri) {
      throw new Error("MONGODB_URI or MONGO_URL must start with mongodb:// or mongodb+srv://")
    }

    const connectionInstance = await mongoose.connect(
      `${mongoUri}/${DB_NAME}`
    );
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection Failed!", error);
    process.exit(1);
  }
};

export default connectDB;
