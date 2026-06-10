import React from "react";
import { TrustLayerDashboardItem } from "../../types/types";
import { ShieldCheck, ShieldAlert, Sparkles, BarChart3, ArrowRight } from "lucide-react";

interface DashboardInsightsProps {
    data: TrustLayerDashboardItem[];
    onAnalyzeCandidate: (applicationId: string) => void;
}

export default function DashboardInsights({ data, onAnalyzeCandidate }: DashboardInsightsProps) {
    // 1. Calculate stats
    const total = data.length;
    const avgTrustScore = total
        ? Math.round(data.reduce((acc, curr) => acc + curr.finalTrustScore, 0) / total)
        : 100;

    const highRiskCount = data.filter(d => d.riskLevel === "High").length;
    const modRiskCount = data.filter(d => d.riskLevel === "Moderate").length;
    const lowRiskCount = data.filter(d => d.riskLevel === "Low").length;

    const highRiskPercent = total ? Math.round((highRiskCount / total) * 100) : 0;
    const modRiskPercent = total ? Math.round((modRiskCount / total) * 100) : 0;
    const lowRiskPercent = total ? Math.round((lowRiskCount / total) * 100) : 0;

    // Concentric Circular gauge variables
    const radius = 46;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (avgTrustScore / 100) * circumference;

    // 2. High Risk Alert items
    const riskAlerts = data.filter(d => d.riskLevel === "High").slice(0, 3);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 font-sans">
            {/* CARD 1: COMPANY TRUST HEALTH GAUGE */}
            <div
                className="bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg"
                style={{
                    border: "1px solid #e2eaf3",
                    boxShadow: "0 4px 24px rgba(10, 31, 61, 0.04)",
                }}
            >
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#00b8d4]" />
                            Company Health
                        </h3>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                            Active
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                        Aggregated hiring reliability score based on active applicant interaction metrics.
                    </p>
                </div>

                <div className="flex items-center justify-around">
                    {/* SVG Gauge */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background Circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r={radius}
                                stroke="#f1f5f9"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            {/* Foreground Circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r={radius}
                                stroke="url(#healthGrad)"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                            />
                            {/* Gradients */}
                            <defs>
                                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#00b8d4" />
                                    <stop offset="100%" stopColor="#1565c0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Text Overlay */}
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-800 tracking-tight">{avgTrustScore}%</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Avg Trust</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold text-slate-800">{total}</span>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Total Tracked</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold text-slate-800">
                                {total ? Math.round(data.reduce((acc, curr) => acc + curr.totalOpens + curr.totalClicks, 0) / total) : 0}
                            </span>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Avg Events</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 2: RISK BREAKDOWN (BAR CHART) */}
            <div
                className="bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg"
                style={{
                    border: "1px solid #e2eaf3",
                    boxShadow: "0 4px 24px rgba(10, 31, 61, 0.04)",
                }}
            >
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-[#1565c0]" />
                        Risk Allocation
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                        Real-time division of candidates into risk pools computed by predictive AI models.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Stacked Horizontal Bar */}
                    <div className="w-full h-3.5 bg-slate-100 rounded-full flex overflow-hidden">
                        <div
                            style={{ width: `${lowRiskPercent}%`, background: "linear-gradient(90deg, #10b981, #059669)" }}
                            title={`Low Risk: ${lowRiskPercent}%`}
                            className="h-full transition-all duration-500"
                        />
                        <div
                            style={{ width: `${modRiskPercent}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)" }}
                            title={`Moderate Risk: ${modRiskPercent}%`}
                            className="h-full transition-all duration-500"
                        />
                        <div
                            style={{ width: `${highRiskPercent}%`, background: "linear-gradient(90deg, #ef4444, #b91c1c)" }}
                            title={`High Risk: ${highRiskPercent}%`}
                            className="h-full transition-all duration-500"
                        />
                    </div>

                    {/* Stats List */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="flex flex-col p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-center">
                            <span className="text-sm font-black text-emerald-600">{lowRiskPercent}%</span>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">Low ({lowRiskCount})</span>
                        </div>
                        <div className="flex flex-col p-2 bg-amber-50/50 rounded-xl border border-amber-100/50 text-center">
                            <span className="text-sm font-black text-amber-600">{modRiskPercent}%</span>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">Mod ({modRiskCount})</span>
                        </div>
                        <div className="flex flex-col p-2 bg-rose-50/50 rounded-xl border border-rose-100/50 text-center">
                            <span className="text-sm font-black text-rose-600">{highRiskPercent}%</span>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">High ({highRiskCount})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 3: AI PREDICTIVE RISK ALERTS */}
            <div
                className="bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg"
                style={{
                    border: "1px solid #e2eaf3",
                    boxShadow: "0 4px 24px rgba(10, 31, 61, 0.04)",
                }}
            >
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        AI Ghosting Alerts
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                        Candidates flagged with severe ghosting warning signals. Actions required:
                    </p>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {!riskAlerts.length ? (
                        <div className="flex flex-col items-center py-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                            <p className="text-[11px] font-bold text-slate-700">All Clear</p>
                            <p className="text-[10px] text-slate-400">No high-risk candidates currently flagged.</p>
                        </div>
                    ) : (
                        riskAlerts.map(c => (
                            <div
                                key={c.applicationId}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{c.candidate.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{c.candidate.jobTitle}</p>
                                </div>
                                <button
                                    onClick={() => onAnalyzeCandidate(c.applicationId)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-[#00b8d4] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                                >
                                    Analyze <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
