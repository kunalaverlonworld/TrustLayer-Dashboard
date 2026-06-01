import { Schema, model, Document, Types } from "mongoose";

export interface IEmployeeIncident extends Document {
    companyId: Types.ObjectId;
    employeeId: Types.ObjectId;
    incidentTypeId: Types.ObjectId;
    impactSnapshot: number;
    note?: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeIncidentSchema = new Schema<IEmployeeIncident>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },
        incidentTypeId: {
            type: Schema.Types.ObjectId,
            ref: "IncidentType",
            required: true,
        },
        impactSnapshot: {
            type: Number,
            required: true,
        },
        note: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Optimized for rolling-window queries
EmployeeIncidentSchema.index({
    companyId: 1,
    employeeId: 1,
    createdAt: -1,
});

export const EmployeeIncident = model<IEmployeeIncident>(
    "EmployeeIncident",
    EmployeeIncidentSchema
);
