import { Types } from "mongoose";
import { Counter } from "../models/Counter";
import { Company } from "../models/Company";

export const generateEmployeeId = async (
    companyId: Types.ObjectId
): Promise<string> => {
    // 1️⃣ Increment counter atomically
    const counter = await Counter.findOneAndUpdate(
        { companyId, sequenceName: "employee" },
        { $inc: { currentValue: 1 } },
        { new: true, upsert: true }
    );

    // 2️⃣ Fetch company code
    const company = await Company.findById(companyId).select("companyCode");

    if (!company) {
        throw new Error("Company not found for ID generation");
    }

    // 3️⃣ Pad number (5 digits)
    const paddedNumber = counter.currentValue
        .toString()
        .padStart(5, "0");

    // 4️⃣ Return formatted ID
    return `${company.companyCode}-EMP-${paddedNumber}`;
};
