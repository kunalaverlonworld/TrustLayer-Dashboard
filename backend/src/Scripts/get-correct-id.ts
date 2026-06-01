import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function getId() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.useDb("offerghst");
        const user = await db.db!.collection("users").findOne({ email: "yaman.k@averlonworld.com" });
        if (user) {
            console.log("EXACT COMPANY_ID STRING:", user.companyId.toString());
            console.log("LENGTH:", user.companyId.toString().length);
        } else {
            console.log("User not found");
        }
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed:", error);
        process.exit(1);
    }
}

getId();
