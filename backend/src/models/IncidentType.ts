import { Schema, model, Document, Types } from "mongoose";

export type IncidentImpactType = "positive" | "negative";

export interface IIncidentType extends Document {
  companyId: Types.ObjectId;
  name: string;
  impact: number;
  type: IncidentImpactType;
  isSystemDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentTypeSchema = new Schema<IIncidentType>(
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
    impact: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["positive", "negative"],
      required: true,
    },
    isSystemDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unique incident name per company
IncidentTypeSchema.index({ companyId: 1, name: 1 }, { unique: true });

export const IncidentType = model<IIncidentType>(
  "IncidentType",
  IncidentTypeSchema
);
