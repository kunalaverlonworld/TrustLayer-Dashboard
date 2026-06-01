import { Schema, model, Document, Types } from "mongoose";

export interface ITrustMetrics extends Document {
    // ── Tenant key (source of truth for isolation) ──────────────────
    companyId: Types.ObjectId;

    // ── Business keys ────────────────────────────────────────────────
    applicationId?: string;       // candidate path (from recruitment SW)
    employeeId?: Types.ObjectId;  // employee path

    // ── Snapshot metadata (display only, NOT used for isolation) ─────
    companyName?: string;

    // ── Candidate details ────────────────────────────────────────────
    candidateName?: string;
    candidateEmail?: string;
    jobTitle?: string;
    department?: string;
    location?: string;
    yearsOfExperience?: number;

    // ── Interaction signals ──────────────────────────────────────────
    openCount: number;
    clickCount: number;
    lastOpenedAt?: Date;
    lastClickAt?: Date;
    sentAt?: Date;

    // ── Computed scores ──────────────────────────────────────────────
    engagementScore: number;
    timeToInteractionSeconds?: number;
    isGhosting: boolean;

    // ── HR workflow flags ────────────────────────────────────────────
    hrFeedbackSubmitted: boolean;
    hrFeedbackEmailSent: boolean;

    updatedAt: Date;
}

const TrustMetricsSchema = new Schema<ITrustMetrics>(
    {
        // ── Tenant key ───────────────────────────────────────────────
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: false,
            index: true,
        },

        // ── Business keys ────────────────────────────────────────────
        applicationId: { type: String, index: true },

        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            index: true,
        },

        // ── Snapshot metadata ─────────────────────────────────────────
        companyName: {
            type: String,
            index: true,
        },

        // ── Candidate details ─────────────────────────────────────────
        candidateName: String,
        candidateEmail: String,
        jobTitle: String,
        department: String,
        location: String,
        yearsOfExperience: Number,

        // ── Interaction signals ───────────────────────────────────────
        openCount: { type: Number, default: 0 },
        clickCount: { type: Number, default: 0 },

        lastOpenedAt: Date,
        lastClickAt: Date,
        sentAt: Date,

        // ── Computed scores ───────────────────────────────────────────
        engagementScore: { type: Number, default: 0 },
        timeToInteractionSeconds: Number,
        isGhosting: { type: Boolean, default: false },

        // ── HR workflow flags ─────────────────────────────────────────
        hrFeedbackSubmitted: { type: Boolean, default: false },
        hrFeedbackEmailSent: { type: Boolean, default: false },

        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Candidate: identifying by name-based tenant for current recruitment API
TrustMetricsSchema.index(
    { companyName: 1, applicationId: 1 },
    {
        unique: true,
        partialFilterExpression: { applicationId: { $exists: true } },
        name: "unique_candidate_per_tenant_name",
    }
);

// Employee: one record per employee per company
TrustMetricsSchema.index(
    { companyId: 1, employeeId: 1 },
    {
        unique: true,
        partialFilterExpression: { employeeId: { $exists: true } },
        name: "unique_employee_per_company",
    }
);

export const TrustMetrics = model<ITrustMetrics>(
    "TrustMetrics",
    TrustMetricsSchema
);