import React, { useEffect, useMemo, useState } from "react";
import { API, submitHRFeedback, sendHrEmail } from "../api/api";
import { TrustLayerDashboardItem, HRFeedbackRequest } from "../types/types";
import { useParams } from "react-router-dom";
import { useSearch } from "../context/SearchContext";


interface ScoreSelectorProps {
    label: string;
    value: number | null;
    onChange: (value: number) => void;
}

const ScoreSelector: React.FC<ScoreSelectorProps> = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
                <button
                    key={score}
                    type="button"
                    onClick={() => onChange(score)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200
            ${value === score
                            ? "bg-black text-white shadow-md scale-105"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                        }`}
                >
                    {score}
                </button>
            ))}
        </div>
    </div>
);

const Toast: React.FC<{
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}> = ({ message, type = "success", onClose }) => (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
        <div
            className={`px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 min-w-[280px]
        ${type === "success"
                    ? "bg-white/90 border-green-200 text-green-700"
                    : "bg-white/90 border-red-200 text-red-600"
                }`}
        >
            <div className={`w-3 h-3 rounded-full ${type === "success" ? "bg-green-500" : "bg-red-500"}`} />
            <span className="font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-black transition"
            >
                ✕
            </button>
        </div>
    </div>
);

const HrFeedbackPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId?: string }>();
    const { searchQuery } = useSearch();
    const [candidates, setCandidates] = useState<TrustLayerDashboardItem[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState<TrustLayerDashboardItem | null>(null);

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

    const [reliabilityScore, setReliabilityScore] = useState<number | null>(null);
    const [communicationScore, setCommunicationScore] = useState<number | null>(null);
    const [commitmentScore, setCommitmentScore] = useState<number | null>(null);
    const [rehireScore, setRehireScore] = useState<number | null>(null);
    const [offerOutcomeScore, setOfferOutcomeScore] = useState<number | null>(null);
    const [comments, setComments] = useState("");

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Fetch all candidates
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (applicationId) {
                    // 🔥 Direct Link Mode
                    const res = await API.getHrFeedbackApplication(applicationId);
                    setSelectedCandidate(res.data);
                    setCandidates([]);
                } else {
                    // 🔥 Dashboard Mode
                    const res = await API.getAllTrackedTrustScores();
                    const filtered = (res.data || []).filter(
                        (c: TrustLayerDashboardItem) => !c.hrFeedbackSubmitted
                    );
                    setCandidates(filtered);
                }
            } catch (err) {
                console.error(err);
                setToast({ message: "Failed to fetch candidate(s).", type: "error" });
            } finally {
                setLoadingCandidates(false);
            }
        };

        fetchData();
    }, [applicationId]);

    const filteredCandidates = useMemo(() => {
        if (!searchQuery.trim()) return candidates;
        const query = searchQuery.toLowerCase();
        return candidates.filter(
            (c) =>
                c.candidate?.name?.toLowerCase().includes(query) ||
                c.candidate?.email?.toLowerCase().includes(query) ||
                c.candidate?.jobTitle?.toLowerCase().includes(query)
        );
    }, [candidates, searchQuery]);


    // Submit HR Feedback
    const handleSubmit = async () => {
        if (
            !selectedCandidate ||
            [reliabilityScore, communicationScore, commitmentScore, rehireScore, offerOutcomeScore].some(v => v === null)
        ) {
            setToast({ message: "Please fill all scores before submitting.", type: "error" });
            return;
        }

        setLoadingSubmit(true);

        const payload: HRFeedbackRequest = {
            reliabilityScore: reliabilityScore!,
            communicationScore: communicationScore!,
            commitmentScore: commitmentScore!,
            rehireScore: rehireScore!,
            offerOutcomeScore: offerOutcomeScore!,
            comments,
        };

        try {
            const res = await submitHRFeedback(selectedCandidate.applicationId, payload);

            // Remove candidate from list
            setCandidates(prev => prev.filter(c => c.applicationId !== selectedCandidate.applicationId));
            setSelectedCandidate(null);

            // Reset scores
            setReliabilityScore(null);
            setCommunicationScore(null);
            setCommitmentScore(null);
            setRehireScore(null);
            setOfferOutcomeScore(null);
            setComments("");

            setToast({ message: `HR Score submitted: ${res.data.hrScore}%`, type: "success" });
        } catch (err: any) {
            setToast({ message: err?.response?.data?.error || "Failed to submit HR feedback.", type: "error" });
        } finally {
            setLoadingSubmit(false);
            setTimeout(() => setToast(null), 4000);
        }
    };

    // Trigger HR Email
    const handleSendEmail = async (c: TrustLayerDashboardItem) => {
        setLoadingEmail(c.applicationId);
        
        // 🚀 Extract previous HR context (defaulting to first employer found)
        const prevEmployer = c.candidate.previousEmployments?.[0];
        const hrEmail = prevEmployer?.hrEmail || "No HR Email Found";
        const hrName = prevEmployer?.hrName || "HR Manager";

        try {
            await sendHrEmail(c.applicationId, {
                hrEmail,
                hrName,
                candidateName: c.candidate.name,
            });
            setToast({ message: "HR email sent successfully ✅", type: "success" });
        } catch (err: any) {
            console.error("Send HR email failed:", err);
            setToast({ message: err?.response?.data?.error || "Failed; see console log.", type: "error" });
        } finally {
            setLoadingEmail(null);
            setTimeout(() => setToast(null), 4000);
        }
    };

    if (loadingCandidates) return <div className="text-center py-20 text-gray-500">Loading candidates...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">HR Feedback</h1>

            {filteredCandidates.length === 0 && (
                <div className="text-center text-gray-500 py-16">All feedback submitted ✔</div>
            )}

            <div className="grid gap-3">
                {filteredCandidates.map((c) => (
                    <div
                        key={c.applicationId}
                        className="flex justify-between items-center p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md transition"
                    >
                        <div>
                            <div className="font-semibold text-gray-900">{c.candidate.name}</div>
                            <div className="text-gray-500 text-sm">{c.candidate.email}</div>
                            <div className="text-gray-400 text-xs mt-1">
                                {c.candidate.jobTitle} • {c.candidate.department} • {c.candidate.stage}
                            </div>
                        </div>

                        <button
                            onClick={() => handleSendEmail(c)}
                            disabled={loadingEmail === c.applicationId}
                            className={`px-4 py-1.5 rounded-xl border border-black font-medium transition
                ${loadingEmail === c.applicationId ? "bg-gray-300 text-gray-600" : "bg-white text-black hover:bg-black hover:text-white"}`}
                        >
                            {loadingEmail === c.applicationId ? "Sending..." : "Send HR Email"}
                        </button>

                        <button
                            onClick={() => setSelectedCandidate(c)}
                            className="px-4 py-1.5 rounded-xl bg-black text-white font-medium hover:scale-[1.03] transition"
                        >
                            Submit Feedback
                        </button>
                    </div>
                ))}
            </div>

            {selectedCandidate && (
                <div 
                    className="fixed inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm"
                    onClick={() => setSelectedCandidate(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedCandidate(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-2">
                            Feedback for {selectedCandidate.candidate.name}
                        </h2>

                        <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-medium">
                                    {selectedCandidate.candidate.yearsOfExperience ?? 0} yrs experience
                                </span>
                                <span className="text-gray-600">{selectedCandidate.candidate.jobTitle}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">{selectedCandidate.candidate.department}</span>
                            </div>

                            {(selectedCandidate.candidate.previousEmployments ?? []).length > 0 && (
                                <div className="space-y-2">
                                    {(selectedCandidate.candidate.previousEmployments ?? []).map((job, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                                            <div className="font-semibold text-gray-800">{job.companyName}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {job.employmentStartDate} – {job.employmentEndDate ?? "Present"}
                                            </div>
                                            {job.consentToContact ? (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    <div>HR: {job.hrName}</div>
                                                    <div>Email: {job.hrEmail}</div>
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-xs text-red-500">HR Contact Not Permitted</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <ScoreSelector label="Reliability" value={reliabilityScore} onChange={setReliabilityScore} />
                            <ScoreSelector label="Communication" value={communicationScore} onChange={setCommunicationScore} />
                            <ScoreSelector label="Commitment" value={commitmentScore} onChange={setCommitmentScore} />
                            <ScoreSelector label="Rehire" value={rehireScore} onChange={setRehireScore} />
                            <ScoreSelector label="Offer Outcome" value={offerOutcomeScore} onChange={setOfferOutcomeScore} />

                            <textarea
                                rows={3}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black/80 resize-none"
                                placeholder="Additional comments..."
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={loadingSubmit}
                                className="w-full py-2 rounded-xl bg-black text-white font-medium disabled:opacity-40 hover:scale-[1.02] transition"
                            >
                                {loadingSubmit ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default HrFeedbackPage;
