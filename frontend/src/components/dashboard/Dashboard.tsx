import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import {
    TrustLayerDashboardItem,
    TrustExplainResponse,
} from "../../types/types";
import DashboardInsights from "./DashboardInsights";
import SummaryCards from "./SummaryCards";
import { motion } from "framer-motion";
import {
    Users, ShieldCheck, ShieldAlert, AlertTriangle,
    Check, X, ClipboardList, Sparkles, BarChart3,
    AlertCircle, Activity, Eye, MousePointer,
    Zap, ArrowUpRight, RefreshCw,
} from "lucide-react";

// ----------------------------------
// Helpers
// ----------------------------------
function getTrustScoreGradient(score: number) {
    if (score >= 75) return "linear-gradient(90deg, #10b981, #059669)";
    if (score >= 45) return "linear-gradient(90deg, #f59e0b, #d97706)";
    return "linear-gradient(90deg, #ef4444, #b91c1c)";
}

function getTrustScoreColor(score: number) {
    if (score >= 75) return "#10b981";
    if (score >= 45) return "#f59e0b";
    return "#ef4444";
}

// ----------------------------------
// Avatar generator
// ----------------------------------
function CandidateAvatar({ name }: { name: string }) {
    const colors = [
        "linear-gradient(135deg,#00b8d4,#1565c0)",
        "linear-gradient(135deg,#7c3aed,#4f46e5)",
        "linear-gradient(135deg,#059669,#0d9488)",
        "linear-gradient(135deg,#d97706,#dc2626)",
        "linear-gradient(135deg,#db2777,#9333ea)",
        "linear-gradient(135deg,#0284c7,#6366f1)",
    ];
    const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
    const initials = name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: colors[idx], boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        >
            {initials}
        </div>
    );
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<TrustLayerDashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [details, setDetails] = useState<TrustExplainResponse | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // -----------------------------
    // Fetch Dashboard Data
    // -----------------------------
    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const res = await API.getAllTrackedTrustScores();
            setData(res.data || []);
            setLastUpdated(new Date());
            setError(null);
        } catch (err: any) {
            console.error("[Dashboard] fetchData error:", err);

            if (!silent) {
                const backendMsg = err?.response?.data?.error || err?.response?.data?.message;
                const code = err?.response?.data?.code;

                if (code === "DB_NOT_CONNECTED" || err?.response?.status === 503) {
                    setError("Database is temporarily unavailable. Please try again in a moment.");
                } else if (err?.response?.status === 401) {
                    setError("Session expired. Please log in again.");
                } else if (err?.isNetworkError) {
                    setError("Cannot reach the server. Please check your connection.");
                } else {
                    setError(backendMsg || "Failed to load dashboard data. Please try again.");
                }
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, []);

    // -----------------------------
    // Top Candidates Slicing
    // -----------------------------
    const topCandidates = useMemo(() => {
        return [...data]
            .sort((a, b) => b.finalTrustScore - a.finalTrustScore)
            .slice(0, 5);
    }, [data]);

    // -----------------------------
    // Fetch Trust Explanation
    // -----------------------------
    const handleViewDetails = async (applicationId: string) => {
        try {
            setSelectedId(applicationId);
            setDetails(null);
            setDetailsLoading(true);
            const res = await API.getTrustExplain(applicationId);
            setDetails(res.data);
        } catch (err) {
            console.error("Failed to fetch trust explanation", err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const getRiskStyle = (risk: string) => {
        switch (risk) {
            case "Low": return { bg: "rgba(16,185,129,0.1)", text: "#059669", border: "rgba(16,185,129,0.25)" };
            case "Moderate": return { bg: "rgba(245,158,11,0.1)", text: "#d97706", border: "rgba(245,158,11,0.25)" };
            default: return { bg: "rgba(239,68,68,0.1)", text: "#dc2626", border: "rgba(239,68,68,0.25)" };
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case "Low": return <ShieldCheck className="w-3.5 h-3.5" />;
            case "Moderate": return <AlertTriangle className="w-3.5 h-3.5" />;
            default: return <ShieldAlert className="w-3.5 h-3.5" />;
        }
    };

    // ----------------------------------
    // Loading State
    // ----------------------------------
    if (loading)
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-5">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-slate-200/60 border-t-[#00b8d4] rounded-full animate-spin" />
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,184,212,0.12), rgba(21,101,192,0.12))",
                        }}
                    >
                        <ShieldCheck className="w-6 h-6 text-[#00b8d4]" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="font-bold text-slate-800 text-sm">Loading Trust Analytics</p>
                    <p className="text-slate-500 text-xs mt-1">Fetching dashboard insights...</p>
                </div>
            </div>
        );

    // ----------------------------------
    // Error State
    // ----------------------------------
    if (error)
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-slate-800">Failed to Load Dashboard</p>
                    <p className="text-rose-600 text-sm mt-1">{error}</p>
                </div>
                <button
                    onClick={() => fetchData()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #00b8d4, #1565c0)" }}
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        );

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04
            }
        }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 220,
                damping: 24
            }
        }
    } as const;

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="min-h-screen pb-10" 
            style={{ fontFamily: "'Inter', sans-serif" }}
        >

            {/* ─── Page Header ─────────────────────────────── */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-7 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_0_12px_rgba(0,184,212,0.06)]"
                            style={{
                                background: "linear-gradient(135deg, rgba(0,184,212,0.1) 0%, rgba(21,101,192,0.05) 100%)",
                                border: "1px solid rgba(0,184,212,0.25)",
                                color: "#00b8d4",
                            }}
                        >
                            <motion.span
                                animate={{ 
                                    rotate: [0, 15, -15, 0],
                                    scale: [1, 1.15, 0.9, 1.1, 1],
                                }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 4, 
                                    ease: "easeInOut",
                                    repeatDelay: 1
                                }}
                                className="flex items-center justify-center text-[#00b8d4]"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                            </motion.span>
                            AI Trust Engine
                        </div>

                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_0_12px_rgba(16,185,129,0.06)]"
                            style={
                                isRefreshing
                                    ? {
                                        background: "rgba(245,158,11,0.08)",
                                        border: "1px solid rgba(245,158,11,0.25)",
                                        color: "#d97706",
                                    }
                                    : {
                                        background: "rgba(16,185,129,0.08)",
                                        border: "1px solid rgba(16,185,129,0.25)",
                                        color: "#059669",
                                    }
                            }
                        >
                            <div className="relative flex h-2 w-2 items-center justify-center">
                                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                                    isRefreshing ? "bg-amber-500" : "bg-emerald-500"
                                }`} />
                                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                                    isRefreshing ? "bg-amber-500" : "bg-emerald-500"
                                }`} />
                            </div>
                            {isRefreshing ? "Syncing..." : "Live"}
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        AI Trust Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Monitor aggregated company health, risk distributions, and real-time reliability signals.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className="text-[10px] text-slate-500 font-medium hidden lg:block">
                        Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        style={{
                            background: "linear-gradient(135deg, #00b8d4, #1565c0)",
                            boxShadow: "0 4px 14px rgba(0,184,212,0.3)",
                        }}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </motion.div>

            {/* ─── Summary Metric Cards Row ─────────────────── */}
            <motion.div variants={itemVariants}>
                <SummaryCards data={data} />
            </motion.div>

            {/* ─── AI Insights & Visualizations ────────────── */}
            <motion.div variants={itemVariants}>
                <DashboardInsights data={data} onAnalyzeCandidate={handleViewDetails} />
            </motion.div>

            {/* ─── Top Candidates glance ────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="rounded-2xl overflow-hidden bg-white mt-8"
                style={{
                    border: "1px solid #e2eaf3",
                    boxShadow: "0 4px 24px rgba(10, 31, 61, 0.04)",
                }}
            >
                {/* Section Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#00b8d4]" />
                            Top Reliable Applicants
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Applicants currently holding the highest predictive reliability scores.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/candidates")}
                        className="flex items-center gap-1 text-xs font-bold text-[#00b8d4] hover:text-[#0097b2] transition-colors self-start sm:self-center"
                    >
                        View Candidates Directory <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Table Data */}
                {!topCandidates.length ? (
                    <div className="p-10 text-center text-slate-500 font-semibold text-sm">
                        No candidate records available
                    </div>
                ) : (
                    <div className="overflow-auto custom-scrollbar">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["Candidate", "Role & Pipeline", "Trust Score", "Risk Level", "Action"].map(col => (
                                        <th
                                            key={col}
                                            className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] text-slate-500"
                                            style={{
                                                borderBottom: "1px solid #e2eaf3",
                                                textAlign: col === "Action" ? "center" : "left"
                                            }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topCandidates.map((item, idx) => {
                                    const riskStyle = getRiskStyle(item.riskLevel);
                                    const score = item.finalTrustScore ?? 0;
                                    return (
                                        <tr
                                            key={item.applicationId}
                                            className="group transition-all duration-150"
                                            style={{
                                                borderBottom: idx < topCandidates.length - 1
                                                    ? "1px solid #e2eaf3"
                                                    : "none",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "rgba(0,184,212,0.04)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "transparent";
                                            }}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <CandidateAvatar name={item.candidate?.name || "Unknown"} />
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">
                                                            {item.candidate?.name || "Unknown"}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                                                            {item.candidate?.email || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800 text-sm">
                                                    {item.candidate?.jobTitle || "—"}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {item.candidate?.department || "—"}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                        style={{
                                                            background: "rgba(0,184,212,0.15)",
                                                            color: "#00b8d4",
                                                            border: "1px solid rgba(0,184,212,0.25)",
                                                        }}
                                                    >
                                                        {item.candidate?.stage || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-base" style={{ color: getTrustScoreColor(score) }}>
                                                        {score.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(score, 100)}%`,
                                                            background: getTrustScoreGradient(score),
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                                                    style={{
                                                        background: riskStyle.bg,
                                                        color: riskStyle.text,
                                                        border: `1px solid ${riskStyle.border}`,
                                                    }}
                                                >
                                                    {getRiskIcon(item.riskLevel)}
                                                    {item.riskLevel}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(item.applicationId)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                    style={{
                                                        background: "rgba(10,31,61,0.03)",
                                                        border: "1px solid #e2eaf3",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "linear-gradient(135deg,#00b8d4,#1565c0)";
                                                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,184,212,0.35)";
                                                        e.currentTarget.style.color = "white";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = "rgba(10,31,61,0.03)";
                                                        e.currentTarget.style.boxShadow = "none";
                                                        e.currentTarget.style.color = "#334155";
                                                    }}
                                                >
                                                    <BarChart3 className="w-3.5 h-3.5" />
                                                    Analyze
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* ─── Trust Explanation Modal ──────────────────── */}
            {selectedId && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    style={{ background: "rgba(10, 31, 61, 0.4)", backdropFilter: "blur(8px)" }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedId(null);
                            setDetails(null);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-xl relative rounded-2xl overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, #FFFFFF 0%, #F4F8FD 100%)",
                            border: "1px solid #e2eaf3",
                            boxShadow: "0 24px 64px rgba(10, 31, 61, 0.15)",
                        }}
                    >
                        <div
                            className="h-1"
                            style={{ background: "linear-gradient(90deg, #00b8d4, #1565c0, #7c3aed)" }}
                        />

                        <div
                            className="flex items-center justify-between px-7 py-5"
                            style={{ borderBottom: "1px solid #e2eaf3" }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(0,184,212,0.15)", border: "1px solid rgba(0,184,212,0.2)" }}
                                >
                                    <ClipboardList className="w-5 h-5 text-[#00b8d4]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800">Trust Score Breakdown</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">AI-generated analysis</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedId(null); setDetails(null); }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                                style={{ background: "rgba(10, 31, 61, 0.03)", border: "1px solid #e2eaf3" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(10, 31, 61, 0.03)"; }}
                            >
                                <X className="w-4 h-4 text-slate-500 hover:text-rose-600" />
                            </button>
                        </div>

                        <div className="px-7 py-6 max-h-[70vh] overflow-y-auto space-y-5">
                            {detailsLoading ? (
                                <div className="flex flex-col justify-center items-center py-12 gap-4">
                                    <div className="w-10 h-10 border-2 border-slate-200 border-t-[#00b8d4] rounded-full animate-spin" />
                                    <p className="text-slate-500 text-sm font-medium">Analyzing trust signals...</p>
                                </div>
                            ) : details ? (
                                <>
                                    <div
                                        className="rounded-2xl p-5"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(0,184,212,0.08), rgba(21,101,192,0.08))",
                                            border: "1px solid rgba(0,184,212,0.2)",
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                                                Overall Trustworthiness
                                            </span>
                                            <span
                                                className="text-3xl font-black"
                                                style={{ color: getTrustScoreColor(details.finalTrustScore) }}
                                            >
                                                {details.finalTrustScore.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${details.finalTrustScore}%`,
                                                    background: getTrustScoreGradient(details.finalTrustScore),
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 mb-3 flex items-center gap-2">
                                            <BarChart3 className="w-3.5 h-3.5 text-[#00b8d4]" />
                                            Evaluation Components
                                        </h3>
                                        <div className="space-y-3">
                                            {details.components?.interaction && (
                                                <div
                                                    className="rounded-xl p-4"
                                                    style={{
                                                        background: "rgba(10, 31, 61, 0.02)",
                                                        border: "1px solid #e2eaf3",
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                            <Activity className="w-3.5 h-3.5 text-[#00b8d4]" />
                                                            Candidate Interaction Rate
                                                        </span>
                                                        <span className="text-xs font-black text-[#00b8d4]">
                                                            {(details.components.interaction.averageNormalizedScore ?? 0).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${details.components.interaction.averageNormalizedScore ?? 0}%`,
                                                                background: "linear-gradient(90deg, #00b8d4, #0284c7)",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                className="rounded-xl p-4"
                                                style={{
                                                    background: "rgba(10, 31, 61, 0.02)",
                                                    border: "1px solid #e2eaf3",
                                                }}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                        <ClipboardList className="w-3.5 h-3.5 text-[#1565c0]" />
                                                        HR Reference Check Score
                                                    </span>
                                                    <span className="text-xs font-black text-[#1565c0]">
                                                        {details.components?.hrFeedback
                                                            ? `${details.components.hrFeedback.calculatedHrScore.toFixed(1)}%`
                                                            : "Pending"}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${details.components?.hrFeedback?.calculatedHrScore ?? 0}%`,
                                                            background: "linear-gradient(90deg, #1565c0, #7c3aed)",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Total Opens", value: details.components?.interaction?.openCountTotal ?? 0, icon: <Eye className="w-4 h-4" />, color: "#00b8d4" },
                                            { label: "Total Clicks", value: details.components?.interaction?.clickCountTotal ?? 0, icon: <MousePointer className="w-4 h-4" />, color: "#1565c0" },
                                            {
                                                label: "Ghosting",
                                                value: details.components?.interaction?.ghostingDetected ? "Alert" : "Clean",
                                                icon: <ShieldCheck className="w-4 h-4" />,
                                                color: details.components?.interaction?.ghostingDetected ? "#ef4444" : "#10b981",
                                            },
                                        ].map(m => (
                                            <div
                                                key={m.label}
                                                className="rounded-xl p-4 text-center"
                                                style={{
                                                    background: "rgba(10, 31, 61, 0.02)",
                                                    border: "1px solid #e2eaf3",
                                                }}
                                            >
                                                <span style={{ color: m.color }} className="flex justify-center mb-2">{m.icon}</span>
                                                <div className="text-base font-black text-[#0a1f3d]">{m.value}</div>
                                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{m.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Key Insights */}
                                    {details.explanation && details.explanation.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 mb-3 flex items-center gap-2">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                Key Insights & Signals
                                            </h3>
                                            <ul className="space-y-2">
                                                {details.explanation.map((line, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed p-3 rounded-xl"
                                                        style={{
                                                            background: "rgba(10, 31, 61, 0.01)",
                                                            border: "1px solid #e2eaf3",
                                                        }}
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                                            style={{ background: "rgba(0,184,212,0.15)" }}
                                                        >
                                                            <Check className="w-2.5 h-2.5 text-[#00b8d4]" />
                                                        </div>
                                                        <span>{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Dashboard;
