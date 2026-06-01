import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHrFeedback extends Document {
    // ── Tenant key (now optional) ───────────────────
    companyId?: Types.ObjectId;

    // ── Business key (primary identifier) ───────────
    applicationId: string;
    companyName: string;

    // ── HR scoring fields ─────────────────────────────────────────────
    reliabilityScore: number;
    communicationScore: number;
    commitmentScore: number;
    rehireScore: number;
    offerOutcomeScore: number;
    comments?: string;

    // ── Computed ──────────────────────────────────────────────────────
    calculatedHrScore: number; // 0–100 normalized

    createdAt: Date;
}

const HrFeedbackSchema = new Schema<IHrFeedback>(
    {
        // ── Tenant key ─────────────────────────────────────────────────
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: false,
            index: true,
        },

        // ── Business key ───────────────────────────────────────────────
        applicationId: { type: String, required: true, index: true },
        companyName: { type: String, required: true, index: true },

        // ── Scoring ────────────────────────────────────────────────────
        reliabilityScore: { type: Number, required: true },
        communicationScore: { type: Number, required: true },
        commitmentScore: { type: Number, required: true },
        rehireScore: { type: Number, required: true },
        offerOutcomeScore: { type: Number, required: true },
        comments: String,
        calculatedHrScore: { type: Number, required: true },
    },
    { timestamps: true }  // gives createdAt + updatedAt automatically
);

// ── Compound index: identify feedback using companyName + applicationId ─────
HrFeedbackSchema.index(
    { companyName: 1, applicationId: 1 },
    { name: "tenant_application_feedback_by_name" }
);

export const HrFeedback = mongoose.model<IHrFeedback>(
    "HrFeedback",
    HrFeedbackSchema
);