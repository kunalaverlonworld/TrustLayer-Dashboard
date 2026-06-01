import { Types } from "mongoose";
import { Company } from "../models/Company";

/**
 * Normalizes a raw company name to a stable lookup key.
 * e.g. "  Trusscore Inc. " → "trusscore inc"
 */
export function normalizeCompanyName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")   // strip punctuation
        .replace(/\s+/g, " ");          // collapse whitespace
}

/**
 * Generates a short, unique company code from a normalized name.
 * e.g. "trusscore inc" → "TRUSSCORE-A3F1"
 */
function generateCompanyCode(normalized: string): string {
    const base = normalized
        .split(" ")[0]
        .toUpperCase()
        .slice(0, 10);

    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${base}-${suffix}`;
}

/**
 * Resolves a company name to a companyId.
 *
 * Strategy:
 *   1. Normalize the raw name from the recruitment API.
 *   2. Look for a Company whose normalized `name` matches.
 *   3. If not found → auto-onboard (create) the company so no data is
 *      quarantined and the system stays self-healing.
 *
 * The returned ObjectId is the canonical tenant key used everywhere
 * in TrustLayer. The raw name is stored only as a snapshot.
 *
 * @param rawName  The company_name string from the recruitment API payload.
 * @returns        { companyId, isNewCompany }
 */
export async function resolveCompanyId(rawName: string): Promise<{
    companyId: Types.ObjectId;
    isNewCompany: boolean;
}> {
    if (!rawName || rawName.trim() === "") {
        throw new Error("resolveCompanyId: rawName must not be empty");
    }

    const normalized = normalizeCompanyName(rawName);

    // ── 1. Try exact normalized match ────────────────────────────────
    const existing = await Company.findOne({
        name: { $regex: `^${normalized}$`, $options: "i" },
    });

    if (existing) {
        return {
            companyId: existing._id as Types.ObjectId,
            isNewCompany: false,
        };
    }

    // ── 2. Auto-onboard: company seen for the first time ─────────────
    console.warn(
        `[resolveCompanyId] Unknown company "${rawName}" — auto-onboarding as pending.`
    );

    const created = await Company.create({
        name: rawName.trim(),           // preserve original casing for display
        companyCode: generateCompanyCode(normalized),
        subscriptionPlan: "basic",
        isActive: true,
    });

    return {
        companyId: created._id as Types.ObjectId,
        isNewCompany: true,
    };
}