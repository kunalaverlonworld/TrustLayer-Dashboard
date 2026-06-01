import { Schema, model, Document, Types } from "mongoose";

export interface ICounter extends Document {
    companyId: Types.ObjectId;
    sequenceName: string;
    currentValue: number;
}

const counterSchema = new Schema<ICounter>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true,
    },
    sequenceName: {
        type: String,
        required: true,
    },
    currentValue: {
        type: Number,
        default: 0,
    },
});

// Unique per company per sequence
counterSchema.index(
    { companyId: 1, sequenceName: 1 },
    { unique: true }
);

export const Counter = model<ICounter>("Counter", counterSchema);
