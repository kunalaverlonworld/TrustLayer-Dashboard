import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function deepSearch() {
    try {
        await mongoose.connect(MONGO_URI);
        const admin = mongoose.connection.db!.admin();
        const dbs = await admin.listDatabases();
        
        console.log("Searching through databases:", dbs.databases.map(db => db.name));

        const connection = mongoose.connection;
        for (const dbInfo of dbs.databases) {
            if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
            
            const db = connection.useDb(dbInfo.name);
            const collections = await db.db!.listCollections().toArray();
            
            for (const col of collections) {
                if (col.name === "users") {
                    const count = await db.db!.collection("users").countDocuments();
                    console.log(`- Database: "${dbInfo.name}", Collection: "users", Count: ${count}`);
                    if (count > 0) {
                        const sample: any = await db.db!.collection("users").findOne({});
                        console.log(`  Sample User: ${sample?.email}`);
                    }
                }
            }
        }
        process.exit(0);
    } catch (error) {
        console.error("❌ Deep search failed:", error);
        process.exit(1);
    }
}

deepSearch();
