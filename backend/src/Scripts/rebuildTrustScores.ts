import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { TrustMetrics } from "../models/TrustMetrics";
import { Employee } from "../models/Employee";
import {
    recalculateCandidateTrust,
    recalculateEmployeeTrust
} from "../services/trustService";

const MONGO_URI = process.env.MONGO_URI || "";

async function runRebuild() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to database");

        /* =====================================================
           STEP 1 — Recalculate Candidate Trust (TrustMetrics)
        ===================================================== */

        const candidateMetrics = await TrustMetrics.find({
            applicationId: { $exists: true },
            companyName: { $exists: true }
        }).select("applicationId companyName");

        for (const metric of candidateMetrics) {
            if (!metric.applicationId || !metric.companyName) continue;

            await recalculateCandidateTrust(
                metric.applicationId.toString(),
                metric.companyName.toString()
            );
        }

        console.log("✅ Candidate trust recalculated");


        /* =====================================================
           STEP 2 — Recalculate Employee Trust (Employee Model)
        ===================================================== */

        const employees = await Employee.find({
            isActive: true
        }).select("_id companyId");

        for (const employee of employees) {
            if (!employee._id || !employee.companyId) {
                console.log(
                    `⚠️ Skipping employee ${employee._id} — missing companyId`
                );
                continue;
            }

            await recalculateEmployeeTrust(
                employee._id.toString(),
                employee.companyId.toString()
            );
        }

        console.log("✅ Employee trust recalculated (All Active Employees)");

        console.log("🎉 Full Trust Rebuild Completed Successfully");

        process.exit(0);

    } catch (error) {
        console.error("❌ Rebuild failed:", error);
        process.exit(1);
    }
}

runRebuild();
