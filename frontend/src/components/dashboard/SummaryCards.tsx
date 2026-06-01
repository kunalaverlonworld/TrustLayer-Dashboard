// src/components/dashboard/SummaryCards.tsx
import React, { useMemo } from "react";
import { TrustLayerDashboardItem } from "../../types/types";

interface Props {
    data: TrustLayerDashboardItem[];
}

const SummaryCards: React.FC<Props> = ({ data }) => {
    const metrics = useMemo(() => {
        const total = data.length;
        const highRisk = data.filter(d => d.riskLevel === "High").length;
        const moderateRisk = data.filter(d => d.riskLevel === "Moderate").length;
        const lowRisk = data.filter(d => d.riskLevel === "Low").length;

        const avgTrust =
            total > 0
                ? (
                    data.reduce((sum, d) => sum + d.finalTrustScore, 0) /
                    total
                ).toFixed(1)
                : "0.0";

        return { total, highRisk, moderateRisk, lowRisk, avgTrust };
    }, [data]);

    const cards = [
        { title: "Total Candidates", value: metrics.total, color: "blue" },
        { title: "Average Trust Score", value: `${metrics.avgTrust}%`, color: "indigo" },
        { title: "High Risk", value: metrics.highRisk, color: "red" },
        { title: "Moderate Risk", value: metrics.moderateRisk, color: "yellow" },
        { title: "Low Risk", value: metrics.lowRisk, color: "green" },
    ];

    return (
        <div className="pt-6 pb-6">
            {/* Container with margin-top to avoid collapsing into header */}
            <div className="flex flex-wrap justify-center gap-4 w-full mt-4">
                {cards.map((c) => (
                    <div
                        key={c.title}
                        className={`
              flex-1 min-w-[140px] max-w-[220px]
              bg-white rounded-2xl p-5
              border border-gray-100
              shadow-md hover:shadow-lg
              transition-shadow duration-300
              flex flex-col justify-between
              text-center
            `}
                    >
                        {/* Accent top bar */}
                        <div
                            className={`h-1 w-12 mx-auto rounded-full mb-3 bg-gradient-to-r from-${c.color}-400 to-${c.color}-600`}
                        />

                        {/* Title */}
                        <div className="text-gray-500 text-sm font-medium mb-1">{c.title}</div>

                        {/* Value */}
                        <div className="text-gray-900 text-2xl font-bold">{c.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SummaryCards;
