import { Schema, model, Document } from "mongoose";

export interface ICompany extends Document {
    name: string;
    companyCode: string;
    subscriptionPlan: "basic" | "pro" | "enterprise";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        subscriptionPlan: {
            type: String,
            enum: ["basic", "pro", "enterprise"],
            default: "basic",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        companyCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true }
);

export const Company = model<ICompany>("Company", companySchema);
