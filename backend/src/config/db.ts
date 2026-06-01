import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined in environment variables");
}

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI, {
            autoIndex: true,
        });

        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.warn("⚠️  MongoDB connection failed:", error);
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
        console.warn("⚠️  Running in development mode without MongoDB");
    }
};

export default connectDB;
