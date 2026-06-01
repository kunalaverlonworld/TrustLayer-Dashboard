import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function diagnose() {
    try {
        console.log("Connecting to:", MONGO_URI.replace(/:([^@]+)@/, ":****@"));
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected successfully");

        const admin = mongoose.connection.db!.admin();
        const dbs = await admin.listDatabases();
        console.log("Available Databases:", dbs.databases.map(db => db.name));

        const currentDb = mongoose.connection.db!;
        console.log("Current Database:", currentDb.databaseName);

        const collections = await currentDb.listCollections().toArray();
        console.log("Collections in current DB:", collections.map(c => c.name));

        if (collections.map(c => c.name).includes("users")) {
            const userCount = await currentDb.collection("users").countDocuments();
            console.log(`User count in 'users' collection: ${userCount}`);
            
            const sampleUser = await currentDb.collection("users").findOne({});
            if (sampleUser) {
                console.log("Sample user email format:", sampleUser.email);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Diagnosis failed:", error);
        process.exit(1);
    }
}

diagnose();
