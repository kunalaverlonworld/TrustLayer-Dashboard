export interface CalculatedMetrics {
    timeToInteractionSeconds?: number;
    engagementScore: number;
    interactionType?: "click" | "open";
    isGhosting: boolean;
}

export function calculateInteractionMetrics(tracking: any): CalculatedMetrics {
    if (!tracking) {
        return {
            engagementScore: 0,
            isGhosting: true,
        };
    }

    const sentAt = tracking?.sentAt ? new Date(tracking.sentAt) : null;

    const lastClick = tracking?.clickedAt
        ? new Date(tracking.clickedAt)
        : tracking?.lastClickAt
            ? new Date(tracking.lastClickAt)
            : null;

    const lastOpen = tracking?.lastOpenedAt
        ? new Date(tracking.lastOpenedAt)
        : null;

    const openCount = tracking?.openCount ?? 0;

    let timeToInteractionSeconds: number | undefined;
    let interactionType: "click" | "open" | undefined;

    // 🔹 Determine primary interaction
    if (sentAt && lastClick && lastClick >= sentAt) {
        timeToInteractionSeconds =
            (lastClick.getTime() - sentAt.getTime()) / 1000;
        interactionType = "click";
    } else if (sentAt && lastOpen && lastOpen >= sentAt) {
        timeToInteractionSeconds =
            (lastOpen.getTime() - sentAt.getTime()) / 1000;
        interactionType = "open";
    }

    let engagementScore = 0;

    if (timeToInteractionSeconds && timeToInteractionSeconds > 0) {
        const hours = timeToInteractionSeconds / 3600;

        // 🔹 Improved bounded decay model (less aggressive)
        if (hours <= 2) {
            engagementScore = 1;
        } else if (hours <= 12) {
            engagementScore = 0.85;
        } else if (hours <= 24) {
            engagementScore = 0.75;
        } else if (hours <= 48) {
            engagementScore = 0.6;
        } else if (hours <= 72) {
            engagementScore = 0.45;
        } else {
            engagementScore = 0.3;
        }
    }

    // 🔹 Boost if clicked (stronger signal than open)
    if (interactionType === "click") {
        engagementScore += 0.1;
    }

    // 🔹 Boost for repeated opens (shows interest)
    if (openCount > 1) {
        engagementScore += 0.05;
    }

    // Clamp to 0–1
    engagementScore = Math.max(0, Math.min(1, engagementScore));

    // 🔹 Smarter ghosting logic
    // Ghosting only if:
    // - No opens
    // - No clicks
    // - No interaction time detected
    const isGhosting =
        openCount === 0 &&
        !lastClick &&
        !lastOpen;

    return {
        timeToInteractionSeconds,
        engagementScore: Number(engagementScore.toFixed(4)),
        interactionType,
        isGhosting,
    };
}
