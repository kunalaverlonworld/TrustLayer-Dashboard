import { Types } from "mongoose";
import { TrustMetrics } from "../models/TrustMetrics";
import { HrFeedback } from "../models/HrFeedback";
import { EmployeeIncident } from "../models/EmployeeIncident";
import { Employee } from "../models/Employee";
import { calculateFinalTrustScore } from "../utils/calculateTrustMetrics";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/* =========================================================
   CANDIDATE TRUST (applicationId + companyName)
========================================================= */

export async function recalculateCandidateTrust(
    applicationId: string,
    companyName: string
): Promise<void> {

    const trustMetrics = await TrustMetrics.findOne({
        applicationId,
        companyName
    });

    if (!trustMetrics) return;

    const engagementScore = trustMetrics.engagementScore ?? 0;
    const isGhosting = trustMetrics.isGhosting ?? false;

    const latestHr = await HrFeedback.findOne({
        applicationId,
        companyName
    })
        .sort({ createdAt: -1 })
        .select("calculatedHrScore");

    const hrScore = latestHr?.calculatedHrScore ?? null;

    const result = calculateFinalTrustScore(
        engagementScore,
        isGhosting,
        hrScore
    );

    trustMetrics.engagementScore = result.interactionScore / 100;
    trustMetrics.updatedAt = new Date();

    await trustMetrics.save();
}

/* =========================================================
   EMPLOYEE TRUST (employeeId + companyId)
========================================================= */

export async function recalculateEmployeeTrust(
    employeeId: string,
    companyId: string
): Promise<void> {

    if (!Types.ObjectId.isValid(employeeId)) return;
    if (!Types.ObjectId.isValid(companyId)) return;

    const employeeObjectId = new Types.ObjectId(employeeId);
    const companyObjectId = new Types.ObjectId(companyId);

    const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);

    // Get last 90 days incidents
    const incidents = await EmployeeIncident.find({
        employeeId: employeeObjectId,
        companyId: companyObjectId,
        createdAt: { $gte: ninetyDaysAgo }
    }).select("impactSnapshot");

    // Sum impact values
    const totalIncidentImpact = incidents.reduce(
        (sum, incident) => sum + (incident.impactSnapshot || 0),
        0
    );

    // ✅ Neutral baseline model
    const BASE_TRUST_SCORE = 70;

    let calculatedTrust = BASE_TRUST_SCORE + totalIncidentImpact;

    // Clamp between 0–100
    let finalTrust = Math.max(0, Math.min(100, calculatedTrust));

    // Risk classification (enterprise-friendly thresholds)
    let riskLevel: "Low" | "Moderate" | "High";

    if (finalTrust >= 85) {
        riskLevel = "Low";
    } else if (finalTrust >= 60) {
        riskLevel = "Moderate";
    } else {
        riskLevel = "High";
    }

    await Employee.findByIdAndUpdate(employeeObjectId, {
        currentTrustScore: Number(finalTrust.toFixed(1)),
        riskLevel
    });
}
