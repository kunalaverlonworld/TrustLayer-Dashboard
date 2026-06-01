import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
    companyId: Types.ObjectId;
    name: string;
    email: string;
    role: "superadmin" | "hr" | "manager";
    passwordHash: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
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
        role: {
            type: String,
            enum: ["superadmin", "hr", "manager"],
            required: true,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Important SaaS index
userSchema.index({ companyId: 1, email: 1 }, { unique: true });

export const User = model<IUser>("User", userSchema);
