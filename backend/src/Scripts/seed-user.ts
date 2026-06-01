import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Company } from "../models/Company";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/trusttlayerr";

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Create a default Company
        let company = await Company.findOne({ companyCode: "DEFAULT" });
        if (!company) {
            company = await Company.create({
                name: "Default Company",
                companyCode: "DEFAULT",
                subscriptionPlan: "pro",
            });
            console.log("✅ Default company created");
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash("password", 10);

        // 3. Create Default Users
        const usersToSeed = [
            { email: "yaman.f@averlonworld.com", name: "Yaman F", role: "superadmin" },
            { email: "admin@averlon.com", name: "Admin User", role: "superadmin" }
        ];

        for (const u of usersToSeed) {
            const existingUser = await User.findOne({ email: u.email });
            if (existingUser) {
                existingUser.passwordHash = passwordHash;
                existingUser.companyId = (company._id as any);
                await existingUser.save();
                console.log(`✅ Updated existing user: ${u.email}`);
            } else {
                await User.create({
                    companyId: company._id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    passwordHash: passwordHash,
                    isActive: true,
                });
                console.log(`✅ Created new user: ${u.email}`);
            }
        }

        console.log("🎉 Seeding completed! You can now sign in.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
