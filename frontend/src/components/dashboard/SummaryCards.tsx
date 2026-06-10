import React, { useMemo } from "react";
import { TrustLayerDashboardItem } from "../../types/types";
import { Users, Shield, ShieldAlert, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

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
                ? (data.reduce((sum, d) => sum + d.finalTrustScore, 0) / total).toFixed(1)
                : "0.0";
        return { total, highRisk, moderateRisk, lowRisk, avgTrust };
    }, [data]);

    const cards = [
        {
            title: "Total Candidates",
            value: metrics.total,
            subtitle: "Tracked in pipeline",
            icon: <Users className="w-5 h-5" />,
            iconColor: "text-sky-500",
            iconBg: "rgba(14,165,233,0.1)",
            accent: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            glowColor: "rgba(14,165,233,0.2)",
            border: "rgba(14,165,233,0.15)",
        },
        {
            title: "Avg Trust Score",
            value: `${metrics.avgTrust}%`,
            subtitle: "Across all candidates",
            icon: <TrendingUp className="w-5 h-5" />,
            iconColor: "text-[#1565c0]",
            iconBg: "rgba(21,101,192,0.1)",
            accent: "linear-gradient(135deg, #1565c0, #0d2d5e)",
            glowColor: "rgba(21,101,192,0.2)",
            border: "rgba(21,101,192,0.15)",
        },
        {
            title: "High Risk",
            value: metrics.highRisk,
            subtitle: "Needs immediate review",
            icon: <ShieldAlert className="w-5 h-5" />,
            iconColor: "text-rose-500",
            iconBg: "rgba(239,68,68,0.1)",
            accent: "linear-gradient(135deg, #ef4444, #b91c1c)",
            glowColor: "rgba(239,68,68,0.2)",
            border: "rgba(239,68,68,0.15)",
        },
        {
            title: "Moderate Risk",
            value: metrics.moderateRisk,
            subtitle: "Monitor closely",
            icon: <AlertTriangle className="w-5 h-5" />,
            iconColor: "text-amber-500",
            iconBg: "rgba(245,158,11,0.1)",
            accent: "linear-gradient(135deg, #f59e0b, #d97706)",
            glowColor: "rgba(245,158,11,0.2)",
            border: "rgba(245,158,11,0.15)",
        },
        {
            title: "Low Risk",
            value: metrics.lowRisk,
            subtitle: "Safe to proceed",
            icon: <ShieldCheck className="w-5 h-5" />,
            iconColor: "text-emerald-500",
            iconBg: "rgba(16,185,129,0.1)",
            accent: "linear-gradient(135deg, #10b981, #059669)",
            glowColor: "rgba(16,185,129,0.2)",
            border: "rgba(16,185,129,0.15)",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {cards.map((c) => (
                <div
                    key={c.title}
                    className="group relative bg-white rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-default"
                    style={{
                        border: `1px solid #e2eaf3`,
                        boxShadow: `0 4px 24px rgba(10, 31, 61, 0.04)`,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 8px 30px ${c.glowColor}`;
                        e.currentTarget.style.borderColor = c.iconColor.includes("sky") ? "rgba(14,165,233,0.4)" : c.iconColor.includes("1565") ? "rgba(21,101,192,0.4)" : c.iconColor.includes("rose") ? "rgba(239,68,68,0.4)" : c.iconColor.includes("amber") ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 4px 24px rgba(10, 31, 61, 0.04)`;
                        e.currentTarget.style.borderColor = `#e2eaf3`;
                    }}
                >
                    {/* Top gradient accent bar */}
                    <div
                        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                        style={{ background: c.accent }}
                    />

                    {/* Icon */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: c.iconBg }}
                    >
                        <span className={c.iconColor}>{c.icon}</span>
                    </div>

                    {/* Value */}
                    <div className="text-[#0a1f3d] text-2xl font-black tracking-tight leading-none mb-1">
                        {c.value}
                    </div>

                    {/* Title */}
                    <div className="text-slate-600 text-xs font-bold mb-0.5 tracking-tight">
                        {c.title}
                    </div>

                    {/* Subtitle */}
                    <div className="text-slate-400 text-[10px] font-medium">
                        {c.subtitle}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
