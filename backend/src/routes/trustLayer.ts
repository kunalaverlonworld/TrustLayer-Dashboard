import { Router, Request, Response } from "express";
import axios from "axios";
import { connection } from "mongoose";
import { TrustMetrics } from "../models/TrustMetrics";
import { calculateInteractionMetrics } from "../utils/calculateInteractionMetrics";
import { calculateFinalTrustScore } from "../utils/calculateTrustMetrics";
import { HrFeedback } from "../models/HrFeedback";
import { webhookService } from "../services/webhookService";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { Company } from "../models/Company";

const router = Router();

/*
-----------------------------------
GET /trustlayer/all
-----------------------------------
Dashboard-ready aggregated view
Multi-tenant safe (applicationId + companyName)
*/
router.get("/all", authenticate, async (req: AuthRequest, res: Response) => {
    const recruitmentApiBaseUrl = process.env.RECRUITMENT_API_URL;
    const userCompanyId = req.user?.companyId;

    try {
        const company = await Company.findById(userCompanyId);
        const userCompanyName = company?.name ?? "Unknown";

        // Try to fetch from recruitment API first
        let rawData: any[] = [];
        const fromExternalApi = recruitmentApiBaseUrl ? true : false;

        if (recruitmentApiBaseUrl && fromExternalApi) {
            try {
                const apiRes = await axios.get(
                    `${recruitmentApiBaseUrl}/ghosting/all-tracked`,
                    {
                        headers: {
                            "x-api-key": process.env.GHOSTING_API_KEY || "",
                        },
                        timeout: 5000,
                    }
                );

                const allRaw = Array.isArray(apiRes.data)
                    ? apiRes.data
                    : [apiRes.data];

                // Filter by companyName (case-insensitive trim match)
                rawData = allRaw.filter((item: any) => {
                    const itemCompanyName = item.candidate?.companyName ?? "";
                    return itemCompanyName.trim().toLowerCase() === userCompanyName.trim().toLowerCase();
                });
            } catch (apiError: any) {
                console.warn(
                    "⚠️ Recruitment API unavailable:",
                    apiError.message
                );
                rawData = [];
            }
        }

        // If no data from recruitment API, fetch from local TrustMetrics
        let results: any[] = [];

        if (rawData.length === 0) {
            console.info("📊 Fetching from local TrustMetrics collection");
            if (connection.readyState !== 1) {
                console.error("❌ MongoDB not connected (readyState:", connection.readyState, ")");
                res.status(503).json({
                    error: "Database connection unavailable. Please try again shortly.",
                    code: "DB_NOT_CONNECTED",
                });
                return;
            }
            const metrics = await TrustMetrics.find({ companyId: userCompanyId }).limit(100);


            results = metrics.map((m: any) => {
                const { finalTrustScore } = calculateFinalTrustScore(
                    m.engagementScore,
                    m.isGhosting,
                    null
                );

                let riskLevel: "Low" | "Moderate" | "High";
                if (finalTrustScore >= 80) riskLevel = "Low";
                else if (finalTrustScore >= 60) riskLevel = "Moderate";
                else riskLevel = "High";

                return {
                    applicationId: m.applicationId,
                    companyName: m.companyName,
                    candidate: {
                        name: m.candidateName || "Unknown",
                        email: m.candidateEmail || "N/A",
                        jobTitle: m.jobTitle || "N/A",
                        department: m.department || "N/A",
                        location: m.location || "N/A",
                        stage: "N/A",
                        yearsOfExperience: m.yearsOfExperience || null,
                        previousEmployments: [],
                    },
                    totalInteractions: 1,
                    totalOpens: m.openCount,
                    totalClicks: m.clickCount,
                    finalTrustScore:
                        Number(finalTrustScore.toFixed(1)),
                    riskLevel,
                    hrFeedbackSubmitted:
                        m.hrFeedbackSubmitted ?? false,
                };
            });
        } else {
            // Process data from recruitment API
            const grouped = rawData.reduce((acc: any, item: any) => {
                const id = item.applicationId;

                if (!acc[id]) {
                    acc[id] = {
                        applicationId: id,
                        companyName:
                            item.candidate?.companyName ?? "Unknown",
                        candidate: item.candidate || {
                            name: "Unknown",
                            email: "N/A",
                            jobTitle: "N/A",
                            department: "N/A",
                            location: "N/A",
                            stage: "N/A",
                            yearsOfExperience: null,
                            previousEmployments: [],
                        },
                        totalInteractions: 0,
                        totalOpens: 0,
                        totalClicks: 0,
                        latestTracking: item,
                    };
                }

                acc[id].totalInteractions += 1;
                acc[id].totalOpens += item.openCount ?? 0;
                acc[id].totalClicks += item.clickCount ?? 0;

                return acc;
            }, {});

            const applicationIds = Object.keys(grouped);

            results = await Promise.all(
                applicationIds.map(async (applicationId) => {
                    const record = grouped[applicationId];
                    const tracking = record.latestTracking;
                    const companyName = record.companyName;

                    const metrics = calculateInteractionMetrics({
                        ...tracking,
                        openCount: record.totalOpens,
                        clickCount: record.totalClicks,
                    });

                    const updatedMetric =
                        await TrustMetrics.findOneAndUpdate(
                            {
                                applicationId,
                                companyName,
                            },
                            {
                                companyId: userCompanyId,
                                applicationId,
                                companyName,
                                openCount: record.totalOpens,
                                clickCount: record.totalClicks,
                                lastOpenedAt:
                                    tracking.lastOpenedAt ?? null,
                                lastClickAt:
                                    tracking.lastClickAt ??
                                    tracking.clickedAt ??
                                    null,
                                sentAt: tracking.sentAt ?? null,
                                engagementScore:
                                    metrics.engagementScore,
                                timeToInteractionSeconds:
                                    metrics.timeToInteractionSeconds,
                                isGhosting:
                                    metrics.isGhosting,
                                updatedAt: new Date(),
                            },
                            { upsert: true, new: true }
                        );

                    const hr = await HrFeedback.findOne({
                        applicationId,
                    }).sort({ createdAt: -1 });

                    const hrScore =
                        hr?.calculatedHrScore ?? null;

                    const { finalTrustScore } =
                        calculateFinalTrustScore(
                            updatedMetric.engagementScore,
                            updatedMetric.isGhosting,
                            hrScore
                        );

                    let riskLevel: "Low" | "Moderate" | "High";

                    if (finalTrustScore >= 80)
                        riskLevel = "Low";
                    else if (finalTrustScore >= 60)
                        riskLevel = "Moderate";
                    else riskLevel = "High";

                    return {
                        applicationId,
                        companyName,
                        candidate: {
                            ...record.candidate,
                            yearsOfExperience:
                                record.candidate
                                    ?.yearsOfExperience ?? null,
                            previousEmployments:
                                record.candidate
                                    ?.previousEmployments ?? [],
                        },
                        totalInteractions:
                            record.totalInteractions,
                        totalOpens: record.totalOpens,
                        totalClicks: record.totalClicks,
                        finalTrustScore:
                            Number(finalTrustScore.toFixed(1)),
                        riskLevel,
                        hrFeedbackSubmitted:
                            updatedMetric.hrFeedbackSubmitted ??
                            false,
                    };
                })
            );
        }

        res.json(results);

    } catch (err: any) {
        console.error("=== Dashboard Loading Critical Error ===");
        console.error("Error Message:", err.message);
        console.error("Stack Trace:", err.stack);
        if (err.response) {
            console.error("Recruitment API Error Data:", err.response.data);
            console.error("Recruitment API Status:", err.response.status);
        }
        res.status(500).json({
            error: "Unable to fetch trust dashboard data",
            details: err.message
        });
    }
});

/*
-----------------------------------
GET /trustlayer/:applicationId
-----------------------------------
Manual single-app refresh
Multi-tenant safe
*/
router.get("/:applicationId", authenticate, async (req: AuthRequest, res: Response) => {
    const { applicationId } = req.params;
    const recruitmentApiBaseUrl = process.env.RECRUITMENT_API_URL;
    const userCompanyId = req.user?.companyId;

    if (!recruitmentApiBaseUrl) {
        return res.status(500).json({
            error: "Recruitment API URL is not configured",
        });
    }

    try {
        const apiRes = await axios.get(
            `${recruitmentApiBaseUrl}/ghosting/interaction/${applicationId}`,
            {
                headers: {
                    "x-api-key": process.env.GHOSTING_API_KEY || "",
                },
            }
        );

        const tracking = apiRes.data;

        const companyName =
            tracking.candidate?.companyName ?? "Unknown";

        const metrics =
            calculateInteractionMetrics(tracking);

        const existing = await TrustMetrics.findOne({ applicationId, companyName });

        const trust =
            await TrustMetrics.findOneAndUpdate(
                {
                    applicationId,
                    companyName,
                },
                {
                    companyId: userCompanyId,
                    applicationId,
                    companyName,
                    openCount:
                        tracking.openCount ?? 0,
                    clickCount:
                        tracking.clickCount ?? 0,
                    lastOpenedAt:
                        tracking.lastOpenedAt ?? null,
                    lastClickAt:
                        tracking.lastClickAt ??
                        tracking.clickedAt ??
                        null,
                    sentAt:
                        tracking.sentAt ?? null,
                    engagementScore:
                        metrics.engagementScore,
                    timeToInteractionSeconds:
                        metrics.timeToInteractionSeconds,
                    isGhosting:
                        metrics.isGhosting,
                    updatedAt: new Date(),
                },
                { upsert: true, new: true }
            );

        if (trust) {
            // Trigger alerts on status changes
            if (trust.isGhosting && (!existing || !existing.isGhosting)) {
                await webhookService.sendNotification(`⚠️ *Candidate Ghosting Alert*`, [
                    { title: "Candidate Name", value: trust.candidateName || "Unknown" },
                    { title: "Job Title", value: trust.jobTitle || "N/A" },
                    { title: "Details", value: "Candidate has gone silent (no open/click events in 48 hours)." }
                ]);
            }
        }

        return res.json({
            ...trust.toObject(),
            candidate: tracking.candidate
                ? {
                    ...tracking.candidate,
                    yearsOfExperience:
                        tracking.candidate
                            ?.yearsOfExperience ??
                        null,
                    previousEmployments:
                        tracking.candidate
                            ?.previousEmployments ??
                        [],
                }
                : null,
        });

    } catch (err: any) {
        console.error(
            "TrustLayer Error:",
            err?.response?.data || err.message
        );

        res.status(500).json({
            error: "Unable to fetch trust data",
        });
    }
});

export default router;
