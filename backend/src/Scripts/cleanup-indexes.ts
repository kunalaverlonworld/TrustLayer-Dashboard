import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function dropIndex() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.useDb("offerghst");
        
        console.log("Dropping old index: unique_candidate_per_company...");
        await db.db!.collection("trustmetrics").dropIndex("unique_candidate_per_company").catch(e => console.log("Index already gone or different name."));
        
        console.log("Dropping old uniqueness rule for developers...");
        await db.db!.collection("trustmetrics").dropIndex("companyId_1_applicationId_1").catch(e => console.log("Not found."));

        console.log("✅ Cleanup complete. Dashboard should load now.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }
}

dropIndex();
