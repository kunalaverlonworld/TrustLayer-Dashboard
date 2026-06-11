import { Router, Request, Response } from "express";
import { TrustMetrics } from "../models/TrustMetrics";
import { HrFeedback } from "../models/HrFeedback";
import {
    calculateFinalTrustScore,
    INTERACTION_WEIGHT,
    HR_WEIGHT,
    GHOSTING_PENALTY
} from "../utils/calculateTrustMetrics";

const router = Router();

router.get("/:applicationId", async (req: Request, res: Response) => {
    const { applicationId } = req.params;

    try {
        // 1️⃣ Fetch ALL interactions
        const interactions = await TrustMetrics.find({ applicationId });

        if (!interactions || interactions.length === 0) {
            return res.status(404).json({
                message: "Interaction metrics not found.",
            });
        }

        // 2️⃣ Fetch latest HR feedback (optional)
        const hr = await HrFeedback.findOne({ applicationId })
            .sort({ createdAt: -1 });

        const hrScore = hr?.calculatedHrScore ?? null;

        // 3️⃣ Calculate trust score per interaction
        const calculated = interactions.map((interaction) =>
            calculateFinalTrustScore(
                interaction.engagementScore,
                interaction.isGhosting,
                hrScore
            )
        );

        // 4️⃣ Aggregate scores
        const avgFinalTrustScore =
            calculated.reduce((sum, item) => sum + item.finalTrustScore, 0) /
            calculated.length;

        const avgInteractionScore =
            calculated.reduce((sum, item) => sum + item.interactionScore, 0) /
            calculated.length;

        const roundedFinal = Number(avgFinalTrustScore.toFixed(1));
        const roundedInteraction = Number(avgInteractionScore.toFixed(1));

        // 5️⃣ Risk classification
        let riskLevel: "Low" | "Moderate" | "High";

        if (roundedFinal >= 80) riskLevel = "Low";
        else if (roundedFinal >= 60) riskLevel = "Moderate";
        else riskLevel = "High";

        // 6️⃣ Component Contributions
        const interactionContribution = hrScore !== null
            ? roundedInteraction * INTERACTION_WEIGHT
            : roundedInteraction;

        const hrContribution = hrScore !== null
            ? hrScore * HR_WEIGHT
            : 0;

        // 7️⃣ Explanation Layer
        const explanation: string[] = [];

        explanation.push(
            `Calculated from ${interactions.length} interaction record(s).`
        );

        if (interactions.some((i) => i.isGhosting)) {
            explanation.push(
                `Ghosting detected in at least one interaction. Penalty of ${GHOSTING_PENALTY} applied where applicable.`
            );
        } else {
            explanation.push("No ghosting detected across interactions.");
        }

        if (hrScore !== null) {
            explanation.push(
                `HR evaluation contributed ${HR_WEIGHT * 100}% to the final trust score.`
            );

            if (hrScore > 80) {
                explanation.push(
                    "Strong HR evaluation significantly increased overall trust."
                );
            }
        } else {
            explanation.push(
                "No HR feedback available. Trust score based entirely on interaction metrics."
            );
        }

        // 7.5️⃣ Timeline Generation Layer
        const timeline: any[] = [];
        
        interactions.forEach(interaction => {
            if (interaction.sentAt) {
                timeline.push({
                    title: "Verification Link Sent",
                    description: "Initial background check and validation link sent to candidate.",
                    timestamp: interaction.sentAt,
                    type: "sent"
                });
            }

            if (interaction.openCount > 0 && interaction.lastOpenedAt) {
                timeline.push({
                    title: "Validation Link Opened",
                    description: `Candidate loaded validation page (Total: ${interaction.openCount} opens).`,
                    timestamp: interaction.lastOpenedAt,
                    type: "open"
                });
            }

            if (interaction.clickCount > 0 && interaction.lastClickAt) {
                timeline.push({
                    title: "Validation Action Clicked",
                    description: `Candidate clicked check status or verification trigger (Total: ${interaction.clickCount} clicks).`,
                    timestamp: interaction.lastClickAt,
                    type: "click"
                });
            }

            if (interaction.hrFeedbackEmailSent) {
                timeline.push({
                    title: "HR Reference Emailed",
                    description: "Verification request sent to candidate's previous employer.",
                    timestamp: interaction.updatedAt ? new Date(interaction.updatedAt.getTime() - 4 * 3600 * 1000) : new Date(),
                    type: "email_sent"
                });
            }

            if (interaction.isGhosting) {
                timeline.push({
                    title: "Ghosting Detected",
                    description: "Alert: Candidate has gone silent for more than 48 hours.",
                    timestamp: interaction.updatedAt || new Date(),
                    type: "ghosting"
                });
            }
        });

        if (hrScore !== null && hr) {
            timeline.push({
                title: "Employer Reference Received",
                description: `Previous employer submitted candidate scores. Final HR Trust Score: ${hrScore}%.`,
                timestamp: (hr as any).createdAt || new Date(),
                type: "feedback"
            });
        }

        timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // 8️⃣ Final Response
        res.json({
            applicationId,
            totalInteractions: interactions.length,
            finalTrustScore: roundedFinal,
            riskLevel,
            components: {
                interaction: {
                    averageNormalizedScore: roundedInteraction,
                    weight: hrScore !== null ? INTERACTION_WEIGHT : 1,
                    weightedContribution: Number(interactionContribution.toFixed(1)),
                    openCountTotal: interactions.reduce((sum, i) => sum + (i.openCount ?? 0), 0),
                    clickCountTotal: interactions.reduce((sum, i) => sum + (i.clickCount ?? 0), 0),
                    ghostingDetected: interactions.some((i) => i.isGhosting),
                },
                hrFeedback: hrScore !== null
                    ? {
                        calculatedHrScore: Number(hrScore.toFixed(1)),
                        weight: HR_WEIGHT,
                        weightedContribution: Number(hrContribution.toFixed(1)),
                        reliabilityScore: hr?.reliabilityScore,
                        communicationScore: hr?.communicationScore,
                        commitmentScore: hr?.commitmentScore,
                        rehireScore: hr?.rehireScore,
                        offerOutcomeScore: hr?.offerOutcomeScore,
                    }
                    : null,
            },
            explanation,
            timeline,
        });

    } catch (error: any) {
        console.error("Explain TrustScore Error:", error.message);
        res.status(500).json({
            message: "Error generating explanation",
            error: error.message,
        });
    }
});

export default router;
