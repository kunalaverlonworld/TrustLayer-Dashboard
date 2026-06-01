// routes/hrFeedback.ts
import axios from "axios";
import { sendHrFeedbackEmail } from "../services/emailService";
import { Router, Request, Response } from "express";
import { HrFeedback } from "../models/HrFeedback";
import { TrustMetrics } from "../models/TrustMetrics"; // ✅ IMPORT ADDED

const router = Router();

function calculateHrScore(data: any): number {
    const total =
        data.reliabilityScore +
        data.communicationScore +
        data.commitmentScore +
        data.rehireScore +
        data.offerOutcomeScore;

    return +((total / 25) * 100).toFixed(1);
}

router.post(
    "/:applicationId",
    async (req: Request<{ applicationId: string }>, res: Response) => {
        const { applicationId } = req.params;

        const {
            reliabilityScore,
            communicationScore,
            commitmentScore,
            rehireScore,
            offerOutcomeScore,
            comments,
        } = req.body;

        try {
            const calculatedHrScore = calculateHrScore(req.body);

            // 1️⃣ Fetch company context from TrustMetrics
            const trustMetric = await TrustMetrics.findOne({ applicationId });

            if (!trustMetric) {
                console.error(`Blocked: No metadata found for application ${applicationId}`);
                return res.status(404).json({
                    error: "Could not find context for this application",
                });
            }

            // 2️⃣ Create HR feedback
            const feedback = await HrFeedback.create({
                applicationId,
                companyId: trustMetric.companyId,
                companyName: trustMetric.companyName || "Unknown Company",
                reliabilityScore,
                communicationScore,
                commitmentScore,
                rehireScore,
                offerOutcomeScore,
                comments,
                calculatedHrScore,
            });

            // 2️⃣ ✅ UPDATE TrustMetrics
            await TrustMetrics.findOneAndUpdate(
                { applicationId },
                {
                    hrFeedbackSubmitted: true,
                    updatedAt: new Date(),
                }
            );

            res.status(201).json({
                message: "HR feedback submitted successfully",
                applicationId,
                hrScore: calculatedHrScore,
            });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                error: "Unable to save HR feedback",
                details: error.message
            });
        }
    }
);

router.post(
    "/send-email/:applicationId",
    async (req: Request<{ applicationId: string }>, res: Response) => {
        const { applicationId } = req.params;
        const recruitmentApiBaseUrl = process.env.RECRUITMENT_API_URL;

        if (!recruitmentApiBaseUrl) {
            return res.status(500).json({
                error: "Recruitment API URL not configured",
            });
        }

        try {
            console.log("=== HR EMAIL TRIGGER START ===");
            console.log("Application ID:", applicationId);

            // 1️⃣ Check duplicate
            const trustMetric = await TrustMetrics.findOne({ applicationId });

            if (trustMetric?.hrFeedbackEmailSent) {
                console.log("Blocked: Email already sent");
                return res.status(400).json({
                    error: "HR email already sent",
                });
            }

            // 2️⃣ Fetch candidate interaction from FastAPI
            const apiRes = await axios.get(
                `${recruitmentApiBaseUrl}/ghosting/interaction/${applicationId}`,
                {
                    headers: {
                        "x-api-key": process.env.GHOSTING_API_KEY || "",
                    },
                }
            );

            const tracking = apiRes.data;

            if (!tracking?.candidate) {
                console.log("Blocked: Candidate data missing");
                return res.status(400).json({
                    error: "Candidate data not found",
                });
            }

            const previousEmployments =
                tracking.candidate.previousEmployments || [];

            if (!previousEmployments.length) {
                console.log("Blocked: No previous employment records");
                return res.status(400).json({
                    error: "No previous employment found",
                });
            }

            // 3️⃣ Send Emails (only eligible ones)
            let emailSentCount = 0;

            for (const job of previousEmployments) {
                if (job?.consentToContact && job?.hrEmail) {
                    await sendHrFeedbackEmail(
                        job.hrEmail,
                        job.hrName,
                        tracking.candidate.name,
                        applicationId
                    );

                    emailSentCount++;
                }
            }

            if (emailSentCount === 0) {
                console.log("Blocked: No eligible HR contacts");
                return res.status(400).json({
                    error:
                        "No eligible HR contacts found (missing consent or email)",
                });
            }

            // 4️⃣ Mark as sent ONLY if at least one email succeeded
            await TrustMetrics.findOneAndUpdate(
                { applicationId },
                {
                    hrFeedbackEmailSent: true,
                    updatedAt: new Date(),
                },
                { upsert: true, new: true }
            );

            console.log(
                `Success: ${emailSentCount} email(s) sent for application ${applicationId}`
            );
            console.log("=== HR EMAIL TRIGGER END ===");

            return res.status(200).json({
                message: "HR email(s) sent successfully",
                sentCount: emailSentCount,
            });

        } catch (error: any) {
            console.error("=== HR EMAIL ROUTE ERROR ===");
            console.error("Application ID:", applicationId);
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
            console.error("============================");

            return res.status(500).json({
                error: "Failed to send HR email",
            });
        }
    }
);

router.get(
    "/:applicationId",
    async (req: Request<{ applicationId: string }>, res: Response) => {
        const { applicationId } = req.params;
        const recruitmentApiBaseUrl = process.env.RECRUITMENT_API_URL;

        if (!recruitmentApiBaseUrl) {
            return res.status(500).json({
                error: "Recruitment API URL not configured",
            });
        }

        try {
            // 1️⃣ Fetch candidate interaction data from external API
            const apiRes = await axios.get(
                `${recruitmentApiBaseUrl}/ghosting/interaction/${applicationId}`,
                {
                    headers: {
                        "x-api-key": process.env.GHOSTING_API_KEY || "",
                    },
                }
            );

            const tracking = apiRes.data;

            if (!tracking?.candidate) {
                return res.status(404).json({
                    error: "Candidate not found",
                });
            }

            // 2️⃣ Fetch TrustMetrics (for feedback status)
            const trustMetric = await TrustMetrics.findOne({ applicationId });

            // 3️⃣ Return clean HR page response
            return res.status(200).json({
                applicationId,
                candidate: tracking.candidate,
                hrFeedbackSubmitted: trustMetric?.hrFeedbackSubmitted ?? false,
                hrFeedbackEmailSent: trustMetric?.hrFeedbackEmailSent ?? false,
            });

        } catch (error: any) {
            console.error("=== HR FEEDBACK GET ERROR ===");
            console.error("Application ID:", applicationId);
            console.error("Message:", error.message);

            return res.status(500).json({
                error: "Failed to fetch HR feedback application",
            });
        }
    }
);

export default router;
