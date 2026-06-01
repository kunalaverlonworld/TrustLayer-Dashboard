/**
 * ONE-TIME MIGRATION: backfill companyId into TrustMetrics + HrFeedback
 *
 * Run ONCE after deploying the new schema, before going live.
 *
 * Usage:
 *   ts-node scripts/backfill-companyId.ts
 *
 * It resolves each record's companyName → Company._id, writes companyId,
 * then confirms counts. Safe to re-run (idempotent — already-migrated
 * records are skipped).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { TrustMetrics } from "../models/TrustMetrics";
import { HrFeedback } from "../models/HrFeedback";
import { resolveCompanyId } from "../utils/resolveCompany";

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");

    // ── 1. Backfill TrustMetrics ────────────────────────────────────
    console.log("\n── Backfilling TrustMetrics ──");

    // Only touch records that still lack companyId
    const tmDocs = await (TrustMetrics as any)
        .find({ companyId: { $exists: false } })
        .lean();

    console.log(`Found ${tmDocs.length} TrustMetrics records to migrate.`);

    let tmOk = 0, tmFail = 0;

    for (const doc of tmDocs) {
        const rawName: string = doc.companyName ?? doc.companyNameSnapshot ?? "";

        if (!rawName) {
            console.warn(`  [SKIP] TrustMetrics _id=${doc._id} — no companyName`);
            tmFail++;
            continue;
        }

        try {
            const { companyId, isNewCompany } =
                await resolveCompanyId(rawName);

            await TrustMetrics.updateOne(
                { _id: doc._id },
                {
                    $set: {
                        companyId,
                        companyNameSnapshot: rawName.trim().toLowerCase(),
                    },
                    $unset: { companyName: "" }, // remove old field
                }
            );

            if (isNewCompany) {
                console.log(
                    `  [AUTO-ONBOARD] "${rawName}" → companyId ${companyId}`
                );
            }

            tmOk++;
        } catch (err: any) {
            console.error(
                `  [ERROR] TrustMetrics _id=${doc._id}: ${err.message}`
            );
            tmFail++;
        }
    }

    console.log(
        `TrustMetrics: ${tmOk} migrated, ${tmFail} skipped/failed.`
    );

    // ── 2. Backfill HrFeedback ──────────────────────────────────────
    console.log("\n── Backfilling HrFeedback ──");

    const hfDocs = await (HrFeedback as any)
        .find({ companyId: { $exists: false } })
        .lean();

    console.log(`Found ${hfDocs.length} HrFeedback records to migrate.`);

    let hfOk = 0, hfFail = 0;

    for (const doc of hfDocs) {
        // Resolve companyId by looking up the corresponding TrustMetrics record
        // (which was just migrated above and now has companyId)
        const tm = await TrustMetrics.findOne({
            applicationId: doc.applicationId,
        }).select("companyId");

        if (!tm?.companyId) {
            console.warn(
                `  [SKIP] HrFeedback _id=${doc._id} — no matching TrustMetrics for applicationId=${doc.applicationId}`
            );
            hfFail++;
            continue;
        }

        await HrFeedback.updateOne(
            { _id: doc._id },
            { $set: { companyId: tm.companyId } }
        );

        hfOk++;
    }

    console.log(
        `HrFeedback: ${hfOk} migrated, ${hfFail} skipped/failed.`
    );

    // ── 3. Summary ──────────────────────────────────────────────────
    console.log("\n── Migration Complete ──");
    console.log(`TrustMetrics without companyId remaining: ${await (TrustMetrics as any)
            .countDocuments({ companyId: { $exists: false } })
        }`);
    console.log(`HrFeedback without companyId remaining: ${await (HrFeedback as any)
            .countDocuments({ companyId: { $exists: false } })
        }`);

    await mongoose.disconnect();
    console.log("Done.");
}

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});