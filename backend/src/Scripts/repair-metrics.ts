import mongoose from "mongoose";
import dotenv from "dotenv";
import { TrustMetrics } from "../models/TrustMetrics";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;
const SYSTEM_COMPANY_ID = process.env.SYSTEM_COMPANY_ID;

async function repair() {
    try {
        if (!SYSTEM_COMPANY_ID) throw new Error("SYSTEM_COMPANY_ID not found in .env");

        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected for repair");

        const result = await TrustMetrics.updateMany(
            { companyId: { $exists: false } },
            { $set: { companyId: new mongoose.Types.ObjectId(SYSTEM_COMPANY_ID) } }
        );

        console.log(`✅ Repair complete! Updated ${result.modifiedCount} records with companyId: ${SYSTEM_COMPANY_ID}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Repair failed:", error);
        process.exit(1);
    }
}

repair();
