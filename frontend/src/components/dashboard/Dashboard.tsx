import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../api/api";
import {
    TrustLayerDashboardItem,
    TrustExplainResponse,
} from "../../types/types";
import SummaryCards from "./SummaryCards";
import { useSearch } from "../../context/SearchContext";
import {
    Users, ShieldCheck, ShieldAlert, AlertTriangle,
    Check, X, ClipboardList, Sparkles, BarChart3,
    AlertCircle, Activity, Eye, MousePointer,
    Zap, ArrowUpRight, Filter, RefreshCw,
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

// ----------------------------------
// Main Dashboard Component
// ----------------------------------
const Dashboard: React.FC = () => {
    const { searchQuery } = useSearch();
    const [data, setData] = useState<TrustLayerDashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [details, setDetails] = useState<TrustExplainResponse | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [filterRisk, setFilterRisk] = useState<string>("all");

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
                // Extract meaningful error message from backend
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
            // On silent refresh failure, keep existing data — don't reset
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
    // Filter & Sort
    // -----------------------------
    const sortedData = useMemo(() => {
        let filtered = [...data];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.candidate?.name?.toLowerCase().includes(query) ||
                    item.candidate?.email?.toLowerCase().includes(query) ||
                    item.candidate?.jobTitle?.toLowerCase().includes(query)
            );
        }

        if (filterRisk !== "all") {
            filtered = filtered.filter(item => item.riskLevel === filterRisk);
        }

        return filtered.sort((a, b) => b.finalTrustScore - a.finalTrustScore);
    }, [data, searchQuery, filterRisk]);

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
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgba(0,184,212,0.15), rgba(21,101,192,0.15))" }}>
                        <ShieldCheck className="w-8 h-8 text-[#00b8d4]" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-2 border-slate-800 border-t-[#00b8d4] rounded-full animate-spin" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-white text-sm">Loading Trust Analytics</p>
                    <p className="text-slate-400 text-xs mt-1">Fetching candidate data...</p>
                </div>
            </div>
        );

    // ----------------------------------
    // Error State
    // ----------------------------------
    if (error)
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-900/50 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-white">Failed to Load Data</p>
                    <p className="text-rose-400 text-sm mt-1">{error}</p>
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

    return (
        <div className="min-h-screen pb-10" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ─── Page Header ─────────────────────────────── */}
            <div className="flex items-start justify-between mb-7">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em]"
                            style={{
                                background: "rgba(0,184,212,0.15)",
                                border: "1px solid rgba(0,184,212,0.3)",
                                color: "#00b8d4",
                            }}
                        >
                            <Sparkles className="w-3 h-3" />
                            AI Trust Engine
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em]"
                            style={{
                                background: isRefreshing ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                                border: `1px solid ${isRefreshing ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
                                color: isRefreshing ? "#fbbf24" : "#4ade80",
                            }}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                            {isRefreshing ? "Syncing..." : "Live"}
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        Candidate Trust Analytics
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Monitor candidate engagement, ghosting signals & AI trust scores in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-400 font-medium hidden lg:block">
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
            </div>

            {/* ─── Summary Cards ────────────────────────────── */}
            <SummaryCards data={sortedData} />

            {/* ─── Filters row ──────────────────────────────── */}
            <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5" />
                        Filter by risk
                    </span>
                    {(["all", "High", "Moderate", "Low"] as const).map(opt => (
                        <button
                            key={opt}
                            onClick={() => setFilterRisk(opt)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                            style={
                                filterRisk === opt
                                    ? {
                                        background: opt === "all"
                                            ? "linear-gradient(135deg, #00b8d4, #1565c0)"
                                            : opt === "High"
                                            ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                                            : opt === "Moderate"
                                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                            : "linear-gradient(135deg, #10b981, #059669)",
                                        color: "#fff",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                                    }
                                    : {
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        color: "#94a3b8",
                                    }
                            }
                        >
                            {opt === "all" ? "All" : opt}
                            {opt !== "all" && (
                                <span className="ml-1 opacity-70">
                                    ({data.filter(d => d.riskLevel === opt).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                    Showing <span className="font-bold text-[#00b8d4]">{sortedData.length}</span> results
                </span>
            </div>

            {/* ─── Empty State ──────────────────────────────── */}
            {!sortedData.length ? (
                <div
                    className="rounded-2xl p-16 text-center"
                    style={{
                        background: "rgba(10, 31, 61, 0.45)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(0,184,212,0.15)" }}
                    >
                        <Users className="w-7 h-7 text-[#00b8d4]" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">No candidates found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "No candidates match the selected filter."}
                    </p>
                </div>
            ) : (

            /* ─── Data Table ────────────────────────────────── */
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: "rgba(10, 31, 61, 0.45)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr
                                style={{
                                    background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,184,212,0.02))",
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                }}
                            >
                                {["Candidate", "Role & Pipeline", "Activity", "Trust Score", "Risk Level", "Actions"].map(col => (
                                    <th
                                        key={col}
                                        className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] text-slate-400"
                                        style={{ textAlign: col === "Actions" ? "center" : "left" }}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData.map((item, idx) => {
                                const riskStyle = getRiskStyle(item.riskLevel);
                                const score = item.finalTrustScore ?? 0;
                                return (
                                    <tr
                                        key={item.applicationId}
                                        className="group transition-all duration-150"
                                        style={{
                                            borderBottom: idx < sortedData.length - 1
                                                ? "1px solid rgba(255,255,255,0.05)"
                                                : "none",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(0,184,212,0.04)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        {/* Candidate */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <CandidateAvatar name={item.candidate?.name || "Unknown"} />
                                                <div>
                                                    <div className="font-bold text-white text-sm">
                                                        {item.candidate?.name || "Unknown"}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                        {item.candidate?.email || "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role & Pipeline */}
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-white text-sm">
                                                {item.candidate?.jobTitle || "—"}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {item.candidate?.department || "—"}
                                                </span>
                                                <span className="text-slate-600">•</span>
                                                <span
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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

                                        {/* Activity */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                    <span className="font-bold text-white">{item.totalOpens ?? 0}</span>
                                                    <span className="text-slate-500">opens</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                    <MousePointer className="w-3.5 h-3.5 text-slate-500" />
                                                    <span className="font-bold text-white">{item.totalClicks ?? 0}</span>
                                                    <span className="text-slate-500">clicks</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                                                <Activity className="w-3 h-3" />
                                                {item.totalInteractions ?? 0} total events
                                            </div>
                                        </td>

                                        {/* Trust Score */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="font-black text-base"
                                                    style={{ color: getTrustScoreColor(score) }}
                                                >
                                                    {score.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(score, 100)}%`,
                                                        background: getTrustScoreGradient(score),
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* Risk Level */}
                                        <td className="px-5 py-4">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                                                style={{
                                                    background: riskStyle.bg,
                                                    color: riskStyle.text,
                                                    border: `1px solid ${riskStyle.border}`,
                                                }}
                                            >
                                                <span style={{ color: riskStyle.text }}>
                                                    {getRiskIcon(item.riskLevel)}
                                                </span>
                                                {item.riskLevel}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(item.applicationId)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: "linear-gradient(135deg, #0a1f3d, #1565c0)",
                                                    border: "1px solid rgba(0, 184, 212, 0.2)",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "linear-gradient(135deg,#00b8d4,#1565c0)";
                                                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,184,212,0.35)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "linear-gradient(135deg, #0a1f3d, #1565c0)";
                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
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

                {/* Table footer */}
                <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.01)",
                    }}
                >
                    <span className="text-[10px] text-slate-400 font-medium">
                        {sortedData.length} candidate{sortedData.length !== 1 ? "s" : ""} • Auto-refreshes every 30s
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#00b8d4] font-bold">
                        <Zap className="w-3 h-3" />
                        AI Powered
                    </div>
                </div>
            </div>

            )}

            {/* ─── Trust Explanation Modal ──────────────────── */}
            {selectedId && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    style={{ background: "rgba(4, 11, 22, 0.8)", backdropFilter: "blur(8px)" }}
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
                            background: "linear-gradient(135deg, #091526 0%, #030811 100%)",
                            border: "1px solid rgba(0, 184, 212, 0.25)",
                            boxShadow: "0 24px 64px rgba(6, 13, 26, 0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
                            backdropFilter: "blur(20px)",
                        }}
                    >
                        {/* Color top bar */}
                        <div
                            className="h-1"
                            style={{ background: "linear-gradient(90deg, #00b8d4, #1565c0, #7c3aed)" }}
                        />

                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-7 py-5"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(0,184,212,0.15)", border: "1px solid rgba(0,184,212,0.2)" }}
                                >
                                    <ClipboardList className="w-5 h-5 text-[#00b8d4]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-white">Trust Score Breakdown</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">AI-generated analysis</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedId(null); setDetails(null); }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                            >
                                <X className="w-4 h-4 text-slate-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-7 py-6 max-h-[70vh] overflow-y-auto space-y-5">
                            {detailsLoading ? (
                                <div className="flex flex-col justify-center items-center py-12 gap-4">
                                    <div className="w-10 h-10 border-2 border-slate-800 border-t-[#00b8d4] rounded-full animate-spin" />
                                    <p className="text-slate-400 text-sm font-medium">Analyzing trust signals...</p>
                                </div>
                            ) : details ? (
                                <>
                                    {/* Overall Score */}
                                    <div
                                        className="rounded-2xl p-5"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(0,184,212,0.08), rgba(21,101,192,0.08))",
                                            border: "1px solid rgba(0,184,212,0.2)",
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                                                Overall Trustworthiness
                                            </span>
                                            <span
                                                className="text-3xl font-black"
                                                style={{ color: getTrustScoreColor(details.finalTrustScore) }}
                                            >
                                                {details.finalTrustScore.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${details.finalTrustScore}%`,
                                                    background: getTrustScoreGradient(details.finalTrustScore),
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                                            <span>Low Trust</span>
                                            <span>High Trust</span>
                                        </div>
                                    </div>

                                    {/* Components */}
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-300 mb-3 flex items-center gap-2">
                                            <BarChart3 className="w-3.5 h-3.5 text-[#00b8d4]" />
                                            Evaluation Components
                                        </h3>
                                        <div className="space-y-3">
                                            {details.components?.interaction && (
                                                <div
                                                    className="rounded-xl p-4"
                                                    style={{
                                                        background: "rgba(10, 31, 61, 0.4)",
                                                        border: "1px solid rgba(255,255,255,0.06)",
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                            <Activity className="w-3.5 h-3.5 text-[#00b8d4]" />
                                                            Candidate Interaction Rate
                                                        </span>
                                                        <span className="text-xs font-black text-[#00b8d4]">
                                                            {(details.components.interaction.averageNormalizedScore ?? 0).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
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
                                                    background: "rgba(10, 31, 61, 0.4)",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                }}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                        <ClipboardList className="w-3.5 h-3.5 text-[#1565c0]" />
                                                        HR Reference Check Score
                                                    </span>
                                                    <span className="text-xs font-black text-[#1565c0]">
                                                        {details.components?.hrFeedback
                                                            ? `${details.components.hrFeedback.calculatedHrScore.toFixed(1)}%`
                                                            : "Pending"}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
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

                                    {/* Metrics grid */}
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
                                                    background: "rgba(10, 31, 61, 0.4)",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                }}
                                            >
                                                <span style={{ color: m.color }} className="flex justify-center mb-2">{m.icon}</span>
                                                <div className="text-base font-black text-white">{m.value}</div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{m.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Key Insights */}
                                    {details.explanation && details.explanation.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-300 mb-3 flex items-center gap-2">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                Key Insights & Signals
                                            </h3>
                                            <ul className="space-y-2">
                                                {details.explanation.map((line, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed p-3 rounded-xl"
                                                        style={{
                                                            background: "rgba(10, 31, 61, 0.3)",
                                                            border: "1px solid rgba(255,255,255,0.05)",
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
        </div>
    );
};

export default Dashboard;
