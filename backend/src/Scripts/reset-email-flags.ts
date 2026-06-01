import mongoose from "mongoose";
import dotenv from "dotenv";
import { TrustMetrics } from "../models/TrustMetrics";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function reset() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.useDb("offerghst");
        
        console.log("Found connection to offerghst. Resetting email flags...");
        
        const result = await TrustMetrics.updateMany(
            {}, 
            { $set: { hrFeedbackEmailSent: false } }
        );

        console.log(`✅ Success! Reset flags for ${result.modifiedCount} candidates.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Reset failed:", error);
        process.exit(1);
    }
}

reset();
