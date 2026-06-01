import { Router, Request, Response } from "express";
import { TrustMetrics } from "../models/TrustMetrics";
import { HrFeedback } from "../models/HrFeedback";
import {
    calculateFinalTrustScore,
    INTERACTION_WEIGHT,
    HR_WEIGHT
} from "../utils/calculateTrustMetrics";

const router = Router();

router.get("/:applicationId", async (req: Request, res: Response) => {
    const { applicationId } = req.params;

    try {
        // 1️⃣ Fetch single TrustMetrics record (unique per application)
        const interaction = await TrustMetrics.findOne({ applicationId });

        if (!interaction) {
            return res.status(404).json({
                message: "Trust metrics not found. Please sync trustLayer first.",
            });
        }

        // 2️⃣ Fetch latest HR feedback
        const hrFeedback = await HrFeedback.findOne({ applicationId })
            .sort({ createdAt: -1 });

        const hrScore = hrFeedback?.calculatedHrScore ?? null;

        // 3️⃣ Calculate final trust score (single snapshot)
        const { finalTrustScore, interactionScore } =
            calculateFinalTrustScore(
                interaction.engagementScore,
                interaction.isGhosting,
                hrScore
            );

        const roundedFinal = Number(finalTrustScore.toFixed(1));

        // 4️⃣ Determine risk level
        let riskLevel: "Low" | "Moderate" | "High";

        if (roundedFinal >= 80) riskLevel = "Low";
        else if (roundedFinal >= 60) riskLevel = "Moderate";
        else riskLevel = "High";

        const weights = hrScore !== null
            ? { interaction: INTERACTION_WEIGHT, hr: HR_WEIGHT }
            : { interaction: 1, hr: 0 };

        res.status(200).json({
            applicationId,
            breakdown: {
                interactionScore: Number(interactionScore.toFixed(1)),
                hrScore: hrScore !== null
                    ? Number(hrScore.toFixed(1))
                    : "Not Available",
                weights,
            },
            finalTrustScore: roundedFinal,
            riskLevel,
        });

    } catch (error: any) {
        console.error("TrustScore Error:", error.message);
        res.status(500).json({
            message: "Error calculating trust score",
            error: error.message,
        });
    }
});

export default router;
