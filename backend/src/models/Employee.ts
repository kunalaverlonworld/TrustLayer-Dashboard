import { Schema, model, Document, Types } from "mongoose";

export type RiskLevel = "low" | "medium" | "high";

export interface IEmployee extends Document {
    companyId: Types.ObjectId;
    employeeId: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
    dateOfJoining: Date;
    isActive: boolean;

    currentTrustScore: number;
    riskLevel: RiskLevel;

    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        employeeId: {
            type: String,
            required: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        department: {
            type: String,
            trim: true,
        },

        designation: {
            type: String,
            trim: true,
        },

        dateOfJoining: {
            type: Date,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // TrustLayer fields
        currentTrustScore: {
            type: Number,
            default: 50,
            min: 0,
            max: 100,
        },

        riskLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
            index: true,
        },
    },
    { timestamps: true }
);

// Company-scoped uniqueness
employeeSchema.index(
    { companyId: 1, employeeId: 1 },
    { unique: true }
);

employeeSchema.index(
    { companyId: 1, email: 1 },
    { unique: true }
);

export const Employee = model<IEmployee>("Employee", employeeSchema);
