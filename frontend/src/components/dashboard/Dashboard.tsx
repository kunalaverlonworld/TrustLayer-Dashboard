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
    ArrowRight, Check, X, ClipboardList, Info,
    MousePointer, Sparkles, Star, BarChart3, Clock, AlertCircle
} from "lucide-react";

const Dashboard: React.FC = () => {
    const { searchQuery } = useSearch();
    const [data, setData] = useState<TrustLayerDashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [details, setDetails] = useState<TrustExplainResponse | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // -----------------------------
    // Fetch Dashboard Data
    // -----------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.getAllTrackedTrustScores();
                setData(res.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Poll every 10 seconds for real-time feel
        const interval = setInterval(fetchData, 10000);

        return () => clearInterval(interval);
    }, []);

    // -----------------------------
    // Filter & Sort by Trust Score
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

        return filtered.sort(
            (a, b) => b.finalTrustScore - a.finalTrustScore
        );
    }, [data, searchQuery]);

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

    // -----------------------------
    // Risk Badges Styling
    // -----------------------------
    const getRiskStyle = (risk: string) => {
        switch (risk) {
            case "Low":
                return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
            case "Moderate":
                return "bg-amber-50 text-amber-700 border-amber-200/80";
            default:
                return "bg-rose-50 text-rose-700 border-rose-200/80";
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case "Low":
                return <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
            case "Moderate":
                return <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />;
            default:
                return <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />;
        }
    };

    if (loading)
        return (
            <div className="flex flex-col justify-center items-center h-96 text-slate-500 space-y-4">
                <div className="w-10 h-10 border-4 border-[#e2eaf3] border-t-[#00b8d4] rounded-full animate-spin" />
                <span className="font-semibold text-sm tracking-wide">Loading Trust Dashboard...</span>
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col justify-center items-center h-96 text-rose-600 space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-rose-600" />
                </div>
                <span className="font-semibold text-sm">{error}</span>
            </div>
        );

    return (
        <div className="min-h-screen pb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header section with background blur */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-cyan-50 border border-cyan-150 text-[#0097b2]">
                    <Sparkles className="w-3 h-3 text-[#00b8d4]" />
                    AI Trust Scoring Engine
                </div>
                <h1 className="text-3xl font-extrabold text-[#0a1f3d] tracking-tight">
                    Candidate Trust Analytics
                </h1>
                <p className="text-[#475569] text-sm mt-1.5">
                    Monitor applicant interaction metrics, ghosting alarms, and reliability ratings in real-time.
                </p>
            </div>

            <SummaryCards data={sortedData} />

            {/* Empty State */}
            {!sortedData.length ? (
                <div className="bg-white rounded-3xl border border-[#e2eaf3] p-16 text-center shadow-[0_4px_20px_rgba(10,31,61,0.02)]">
                    <div className="w-16 h-16 rounded-full bg-[#e0f7fa]/30 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-[#00b8d4]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1f3d] mb-1">No applications found</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        We couldn't find any candidate matches. Try searching for a different keyword.
                    </p>
                </div>
            ) : (
                /* Table Card Container */
                <div className="bg-white rounded-3xl border border-[#e2eaf3] overflow-hidden shadow-[0_4px_24px_rgba(10,31,61,0.03)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/70 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-[#e2eaf3]">
                                    <th className="px-6 py-4.5 text-left font-bold">Candidate</th>
                                    <th className="px-6 py-4.5 text-left font-bold">Role & Pipeline</th>
                                    <th className="px-6 py-4.5 text-center font-bold">Total Events</th>
                                    <th className="px-6 py-4.5 text-center font-bold">Opens</th>
                                    <th className="px-6 py-4.5 text-center font-bold">Clicks</th>
                                    <th className="px-6 py-4.5 text-center font-bold">Trust Score</th>
                                    <th className="px-6 py-4.5 text-center font-bold">Risk Level</th>
                                    <th className="px-6 py-4.5 text-center font-bold">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#e2eaf3]/60">
                                {sortedData.map((item) => (
                                    <tr
                                        key={item.applicationId}
                                        className="hover:bg-slate-50/40 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4.5">
                                            <div className="font-semibold text-[#0a1f3d] text-sm">
                                                {item.candidate?.name || "Unknown"}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                {item.candidate?.email || "-"}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4.5">
                                            <div className="font-medium text-[#475569]">
                                                {item.candidate?.jobTitle || "-"}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                {item.candidate?.department || "-"} •{" "}
                                                <span className="text-[#0097b2] font-semibold">{item.candidate?.stage || "-"}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4.5 text-center font-semibold text-[#0a1f3d]">
                                            {item.totalInteractions ?? 0}
                                        </td>

                                        <td className="px-6 py-4.5 text-center font-semibold text-[#475569]">
                                            {item.totalOpens ?? 0}
                                        </td>

                                        <td className="px-6 py-4.5 text-center font-semibold text-[#475569]">
                                            {item.totalClicks ?? 0}
                                        </td>

                                        <td className="px-6 py-4.5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-extrabold text-slate-800 text-sm">
                                                    {(item.finalTrustScore ?? 0).toFixed(1)}%
                                                </span>
                                                <div className="w-20 bg-[#e2eaf3] rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-[#00b8d4] to-[#1565c0] h-full rounded-full"
                                                        style={{
                                                            width: `${item.finalTrustScore ?? 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4.5 text-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRiskStyle(
                                                    item.riskLevel
                                                )}`}
                                            >
                                                {getRiskIcon(item.riskLevel)}
                                                {item.riskLevel}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4.5 text-center">
                                            <button
                                                onClick={() =>
                                                    handleViewDetails(item.applicationId)
                                                }
                                                className="inline-flex items-center px-4 py-2 text-xs font-bold bg-[#0a1f3d] hover:bg-[#00b8d4] text-white rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* -----------------------------
              Trust Explanation Details Modal
            ----------------------------- */}
            {selectedId && (
                <div className="fixed inset-0 bg-[#0a1f3d]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div 
                        className="bg-white w-full max-w-xl rounded-3xl shadow-[0_24px_64px_rgba(10,31,61,0.25)] border border-[#e2eaf3] p-8 relative overflow-hidden animate-in fade-in zoom-in duration-200"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {/* Glow top border */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00b8d4] to-[#1565c0]" />

                        {/* Close button */}
                        <button
                            onClick={() => {
                                setSelectedId(null);
                                setDetails(null);
                            }}
                            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-[#94a3b8] hover:text-[#0a1f3d] transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {detailsLoading ? (
                            <div className="flex flex-col justify-center items-center py-12 space-y-3">
                                <div className="w-8 h-8 border-4 border-[#e2eaf3] border-t-[#00b8d4] rounded-full animate-spin" />
                                <span className="text-slate-400 font-semibold text-xs tracking-wider">Analyzing breakdowns...</span>
                            </div>
                        ) : details ? (
                            <>
                                <div className="flex items-center gap-2.5 mb-6">
                                    <div className="p-2 bg-[#e0f7fa]/40 rounded-xl">
                                        <ClipboardList className="w-5 h-5 text-[#00b8d4]" />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-[#0a1f3d]">
                                        Trust Score Breakdown
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Overall gauge card */}
                                    <div className="bg-[#f0f7ff]/40 border border-[#e0f0ff] rounded-2xl p-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Overall Trustworthiness</span>
                                            <span className="text-2xl font-black text-[#1565c0]">
                                                {details.finalTrustScore.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#e2eaf3] rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[#00b8d4] to-[#1565c0] h-full rounded-full"
                                                style={{ width: `${details.finalTrustScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Score Component Bars */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0a1f3d]">Evaluation Components</h3>
                                        
                                        {/* Interaction Score */}
                                        {details.components?.interaction && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold text-[#475569]">
                                                    <span>Candidate interaction rate</span>
                                                    <span className="font-bold text-[#0a1f3d]">
                                                        {(details.components.interaction.averageNormalizedScore ?? 0).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-[#00b8d4] h-1.5 rounded-full"
                                                        style={{ width: `${details.components.interaction.averageNormalizedScore ?? 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* HR Feedback Score */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold text-[#475569]">
                                                <span>HR reference check score</span>
                                                <span className="font-bold text-[#0a1f3d]">
                                                    {details.components?.hrFeedback
                                                        ? `${details.components.hrFeedback.calculatedHrScore.toFixed(1)}%`
                                                        : "Pending Submission"}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                <div
                                                    className="bg-[#1565c0] h-1.5 rounded-full"
                                                    style={{ width: `${details.components?.hrFeedback?.calculatedHrScore ?? 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metric Details grid */}
                                    <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-[#e2eaf3] rounded-2xl p-4">
                                        <div className="text-center">
                                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Opens</div>
                                            <div className="text-base font-extrabold text-[#0a1f3d] mt-0.5">
                                                {details.components?.interaction?.openCountTotal ?? 0}
                                            </div>
                                        </div>
                                        <div className="text-center border-x border-[#e2eaf3]">
                                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Clicks</div>
                                            <div className="text-base font-extrabold text-[#0a1f3d] mt-0.5">
                                                {details.components?.interaction?.clickCountTotal ?? 0}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Ghosting Flag</div>
                                            <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold mt-1 uppercase ${
                                                details.components?.interaction?.ghostingDetected 
                                                    ? 'bg-rose-100 text-rose-700' 
                                                    : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {details.components?.interaction?.ghostingDetected ? "Alert" : "Clean"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Explanations checklists */}
                                    {details.explanation && details.explanation.length > 0 && (
                                        <div className="space-y-2.5">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0a1f3d] mb-2 flex items-center gap-1.5">
                                                <AlertCircle className="w-3.5 h-3.5 text-cyan-600" />
                                                Key Insights & Signals
                                            </h3>
                                            <ul className="space-y-2">
                                                {details.explanation.map((line, index) => (
                                                    <li key={index} className="flex items-start gap-2.5 text-xs text-[#475569] leading-relaxed">
                                                        <div className="mt-0.5 p-0.5 bg-cyan-50 rounded-full flex-shrink-0">
                                                            <Check className="w-3 h-3 text-[#0097b2]" />
                                                        </div>
                                                        <span>{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
