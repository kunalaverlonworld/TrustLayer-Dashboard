import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function checkTrustMetrics() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.useDb("offerghst");
        const count = await db.db!.collection("trustmetrics").countDocuments();
        console.log(`TrustMetrics count in 'offerghst': ${count}`);
        
        const metrics = await db.db!.collection("trustmetrics").find({}).toArray();
        console.log("TrustMetrics records:");
        metrics.forEach(m => {
            console.log(`- ID: ${m._id}, applicationId: ${m.applicationId}, companyId: ${m.companyId}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed:", error);
        process.exit(1);
    }
}

checkTrustMetrics();
