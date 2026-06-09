import React, { useMemo } from "react";
import { TrustLayerDashboardItem } from "../../types/types";
import { Users, Shield, ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";

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
        { 
            title: "Total Candidates", 
            value: metrics.total, 
            icon: <Users className="w-5 h-5 text-[#00b8d4]" />, 
            gradient: "from-[#00b8d4] to-[#0097b2]",
            bgLight: "bg-[#e0f7fa]/30",
            shadowColor: "rgba(0,184,212,0.12)"
        },
        { 
            title: "Average Trust Score", 
            value: `${metrics.avgTrust}%`, 
            icon: <Shield className="w-5 h-5 text-[#1565c0]" />, 
            gradient: "from-[#1565c0] to-[#0d2d5e]",
            bgLight: "bg-[#e8f0fe]/40",
            shadowColor: "rgba(21,101,192,0.12)"
        },
        { 
            title: "High Risk Candidates", 
            value: metrics.highRisk, 
            icon: <ShieldAlert className="w-5 h-5 text-[#ef4444]" />, 
            gradient: "from-[#ef4444] to-[#b91c1c]",
            bgLight: "bg-[#fee2e2]/40",
            shadowColor: "rgba(239,68,68,0.12)"
        },
        { 
            title: "Moderate Risk", 
            value: metrics.moderateRisk, 
            icon: <AlertTriangle className="w-5 h-5 text-[#d97706]" />, 
            gradient: "from-[#f59e0b] to-[#d97706]",
            bgLight: "bg-[#fef3c7]/40",
            shadowColor: "rgba(245,158,11,0.12)"
        },
        { 
            title: "Low Risk Candidates", 
            value: metrics.lowRisk, 
            icon: <ShieldCheck className="w-5 h-5 text-[#16a34a]" />, 
            gradient: "from-[#16a34a] to-[#15803d]",
            bgLight: "bg-[#f0fdf4]/40",
            shadowColor: "rgba(22,163,74,0.12)"
        },
    ];

    return (
        <div className="py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {cards.map((c) => (
                    <div
                        key={c.title}
                        className="group relative bg-white rounded-2xl p-5 border border-[#e2eaf3] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        style={{
                            boxShadow: `0 4px 20px rgba(10,31,61,0.03)`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 10px 25px ${c.shadowColor}`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = `0 4px 20px rgba(10,31,61,0.03)`;
                        }}
                    >
                        {/* Glow accent behind icon on card hover */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-[#f8fbff] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />

                        {/* Top bar accent */}
                        <div
                            className={`h-1.5 w-10 rounded-full mb-4 bg-gradient-to-r ${c.gradient}`}
                        />

                        {/* Icon and Title Row */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[#64748b] text-xs font-semibold uppercase tracking-wider text-left">
                                {c.title}
                            </span>
                            <div className={`p-2 rounded-xl ${c.bgLight} flex items-center justify-center flex-shrink-0`}>
                                {c.icon}
                            </div>
                        </div>

                        {/* Value */}
                        <div className="text-left mt-2">
                            <span className="text-[#0a1f3d] text-3xl font-extrabold tracking-tight">
                                {c.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SummaryCards;
