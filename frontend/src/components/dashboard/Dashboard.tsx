import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../api/api";
import {
    TrustLayerDashboardItem,
    TrustExplainResponse,
} from "../../types/types";
import SummaryCards from "./SummaryCards";
import { useSearch } from "../../context/SearchContext";

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
                setError("Failed to load dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Optional: Poll every 10 seconds (MVP live feel)
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
    // Risk Styling
    // -----------------------------
    const getRiskStyle = (risk: string) => {
        switch (risk) {
            case "Low":
                return "bg-green-100 text-green-700 border-green-300";
            case "Moderate":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            default:
                return "bg-red-100 text-red-700 border-red-300";
        }
    };

    // -----------------------------
    // States
    // -----------------------------
    if (loading)
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                Loading Trust Dashboard...
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center items-center h-64 text-red-600">
                {error}
            </div>
        );

    if (!sortedData.length)
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                No applications found.
            </div>
        );

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <div className="bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">
                Trust Intelligence Dashboard
            </h1>

            <SummaryCards data={sortedData} />

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 text-left">Candidate</th>
                            <th className="px-6 py-4 text-left">Role</th>
                            <th className="px-6 py-4 text-center">Interactions</th>
                            <th className="px-6 py-4 text-center">Opens</th>
                            <th className="px-6 py-4 text-center">Clicks</th>
                            <th className="px-6 py-4 text-center">Trust</th>
                            <th className="px-6 py-4 text-center">Risk</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedData.map((item) => (
                            <tr
                                key={item.applicationId}
                                className="border-t hover:bg-gray-50 transition"
                            >
                                <td className="px-6 py-4">
                                    <div className="font-semibold">
                                        {item.candidate?.name || "Unknown"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.candidate?.email || "-"}
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div>{item.candidate?.jobTitle || "-"}</div>
                                    <div className="text-xs text-gray-500">
                                        {item.candidate?.department || "-"} •{" "}
                                        {item.candidate?.stage || "-"}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    {item.totalInteractions ?? 0}
                                </td>

                                <td className="px-6 py-4 text-center">
                                    {item.totalOpens ?? 0}
                                </td>

                                <td className="px-6 py-4 text-center">
                                    {item.totalClicks ?? 0}
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-lg">
                                            {item.finalTrustScore?.toFixed(1) ?? "0"}%
                                        </span>
                                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${item.finalTrustScore ?? 0}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskStyle(
                                            item.riskLevel
                                        )}`}
                                    >
                                        {item.riskLevel}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() =>
                                            handleViewDetails(item.applicationId)
                                        }
                                        className="px-4 py-2 text-xs bg-black text-white rounded-lg hover:opacity-80"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* -----------------------------
          Details Modal
         ----------------------------- */}
            {selectedId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 relative">
                        <button
                            onClick={() => {
                                setSelectedId(null);
                                setDetails(null);
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        {detailsLoading ? (
                            <div className="text-center py-10">
                                Loading trust explanation...
                            </div>
                        ) : details ? (
                            <>
                                <h2 className="text-2xl font-bold mb-6">
                                    Trust Breakdown
                                </h2>

                                <div className="space-y-4 text-sm">

                                    <div>
                                        <strong>Final Trust Score:</strong>{" "}
                                        {details.finalTrustScore.toFixed(1)}%
                                    </div>

                                    <hr />

                                    <div>
                                        <strong>Interaction Score:</strong>{" "}
                                        {details.components?.interaction
                                            ? details.components.interaction.averageNormalizedScore.toFixed(
                                                1
                                            )
                                            : "-"}
                                    </div>

                                    <div>
                                        <strong>Open Count:</strong>{" "}
                                        {details.components?.interaction?.openCountTotal ?? "-"}
                                    </div>

                                    <div>
                                        <strong>Click Count:</strong>{" "}
                                        {details.components?.interaction?.clickCountTotal ?? "-"}
                                    </div>

                                    <div>
                                        <strong>Ghosting Detected:</strong>{" "}
                                        {details.components?.interaction?.ghostingDetected
                                            ? "Yes"
                                            : "No"}
                                    </div>

                                    <hr />

                                    <div>
                                        <strong>HR Score:</strong>{" "}
                                        {details.components?.hrFeedback
                                            ? details.components.hrFeedback.calculatedHrScore
                                            : "Not submitted"}
                                    </div>

                                    <hr />

                                    <div>
                                        <strong>Explanation:</strong>
                                        <ul className="list-disc ml-6 mt-2 space-y-1">
                                            {details.explanation?.map((line, index) => (
                                                <li key={index}>{line}</li>
                                            ))}
                                        </ul>
                                    </div>

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
