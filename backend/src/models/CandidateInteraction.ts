import { Schema, model, Document, Types } from "mongoose";

export interface ICandidateInteraction extends Document {
    candidateId: string; // ID from recruitment system
    email: string;
    jobTitle: string;
    events: {
        type: "email_open" | "email_reply" | "document_upload" | "portal_visit" | "interview_action";
        timestamp: Date;
        meta?: Record<string, any>; // Any additional info like upload link, page name, email id, etc.
    }[];
    lastUpdated: Date;
}

const CandidateInteractionSchema = new Schema<ICandidateInteraction>({
    candidateId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    jobTitle: { type: String, required: true },
    events: [
        {
            type: {
                type: String,
                enum: ["email_open", "email_reply", "document_upload", "portal_visit", "interview_action"],
                required: true,
            },
            timestamp: { type: Date, default: Date.now },
            meta: { type: Schema.Types.Mixed, default: {} },
        },
    ],
    lastUpdated: { type: Date, default: Date.now },
});

// Update lastUpdated automatically on events change
CandidateInteractionSchema.pre<ICandidateInteraction>("save", async function () {
    this.lastUpdated = new Date();
});

export const CandidateInteraction = model<ICandidateInteraction>(
    "CandidateInteraction",
    CandidateInteractionSchema
);
