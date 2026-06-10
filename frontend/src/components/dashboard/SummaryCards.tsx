import React, { useMemo } from "react";
import { TrustLayerDashboardItem } from "../../types/types";
import { Users, ShieldAlert, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

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
            subtitle: "In pipeline",
            icon: <Users className="w-4 h-4" />,
            iconColor: "text-sky-500",
            iconBg: "rgba(14,165,233,0.08)",
        },
        {
            title: "Avg Trust Score",
            value: `${metrics.avgTrust}%`,
            subtitle: "Overall average",
            icon: <TrendingUp className="w-4 h-4" />,
            iconColor: "text-indigo-500",
            iconBg: "rgba(99,102,241,0.08)",
        },
        {
            title: "High Risk",
            value: metrics.highRisk,
            subtitle: "Action required",
            icon: <ShieldAlert className="w-4 h-4" />,
            iconColor: "text-rose-500",
            iconBg: "rgba(239,68,68,0.08)",
        },
        {
            title: "Moderate Risk",
            value: metrics.moderateRisk,
            subtitle: "Monitor closely",
            icon: <AlertTriangle className="w-4 h-4" />,
            iconColor: "text-amber-500",
            iconBg: "rgba(245,158,11,0.08)",
        },
        {
            title: "Low Risk",
            value: metrics.lowRisk,
            subtitle: "Safe to proceed",
            icon: <ShieldCheck className="w-4 h-4" />,
            iconColor: "text-emerald-500",
            iconBg: "rgba(16,185,129,0.08)",
        },
    ];

    return (
        <div 
            className="bg-white rounded-2xl flex flex-col md:flex-row items-stretch mb-6 overflow-hidden"
            style={{
                border: "1px solid #e2eaf3",
                boxShadow: "0 4px 24px rgba(10, 31, 61, 0.04)",
            }}
        >
            {cards.map((c, idx) => (
                <div
                    key={c.title}
                    className="flex-1 flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-slate-50/50 cursor-default border-b md:border-b-0 md:border-r last:border-b-0 last:border-r-0 border-slate-100"
                >
                    {/* Icon */}
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: c.iconBg }}
                    >
                        <span className={c.iconColor}>{c.icon}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none mb-1.5 truncate">
                            {c.title}
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[#0a1f3d] text-lg font-black tracking-tight leading-none">
                                {c.value}
                            </span>
                            <span className="text-slate-400 text-[10px] font-medium leading-none truncate hidden lg:inline">
                                {c.subtitle}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
