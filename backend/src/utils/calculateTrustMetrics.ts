// utils/calculateTrustMetrics.ts

export interface TrustScoreResult {
    interactionScore: number;
    finalTrustScore: number;
    riskLevel: "Low" | "Moderate" | "High";
    hrIncluded: boolean;
}

export const INTERACTION_WEIGHT = 0.6;
export const HR_WEIGHT = 0.4;
export const GHOSTING_PENALTY = 20;

export function calculateFinalTrustScore(
    engagementScore: number,
    isGhosting: boolean,
    hrScore?: number | null
): TrustScoreResult {

    const safeEngagement = Math.max(0, Math.min(1, engagementScore || 0));

    let interactionScore = safeEngagement * 100;

    if (isGhosting) {
        interactionScore -= GHOSTING_PENALTY;
    }

    interactionScore = Math.max(0, Math.min(100, interactionScore));

    let finalTrustScore: number;
    let hrIncluded = false;

    if (hrScore !== undefined && hrScore !== null) {
        const safeHrScore = Math.max(0, Math.min(100, hrScore));
        finalTrustScore =
            interactionScore * INTERACTION_WEIGHT +
            safeHrScore * HR_WEIGHT;
        hrIncluded = true;
    } else {
        // ✅ No HR feedback → rely fully on interaction score
        finalTrustScore = interactionScore;
    }

    let riskLevel: "Low" | "Moderate" | "High";

    if (finalTrustScore >= 80) {
        riskLevel = "Low";
    } else if (finalTrustScore >= 60) {
        riskLevel = "Moderate";
    } else {
        riskLevel = "High";
    }

    return {
        interactionScore: Number(interactionScore.toFixed(1)),
        finalTrustScore: Number(finalTrustScore.toFixed(1)),
        riskLevel,
        hrIncluded,
    };
}
