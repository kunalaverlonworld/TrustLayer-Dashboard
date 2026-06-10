import React, { useEffect, useMemo, useState } from "react";
import { API, submitHRFeedback, sendHrEmail } from "../api/api";
import { TrustLayerDashboardItem, HRFeedbackRequest } from "../types/types";
import { useParams } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import {
    Users, Mail, Star, CheckCircle2, X, Send,
    Briefcase, MessageSquare, ShieldCheck,
    ChevronRight, Clock, Building2, UserCheck,
    AlertCircle, Loader2, Search, ClipboardList,
} from "lucide-react";

// ─── Design tokens (matches Dashboard) ──────────────────────────────────────
const C = {
    navy:      "#0a1f3d", // dark navy matching headers/titles
    navyMid:   "#0d2d5e", // sub-headers/labels
    teal:      "#00b8d4",
    tealDark:  "#0097b2",
    tealLight: "rgba(0,184,212,0.08)",
    blue:      "#1565c0",
    body:      "#475569", // body text/info values
    muted:     "#94a3b8", // minor muted details
    border:    "#e2eaf3", // subtle light borders
    bg:        "transparent",
    white:     "#ffffff", // card background
};

// ─── Score selector ──────────────────────────────────────────────────────────
interface ScoreSelectorProps {
    label: string;
    icon: React.ReactNode;
    value: number | null;
    onChange: (value: number) => void;
}

const SCORE_LABELS = ["", "Poor", "Below Avg", "Average", "Good", "Excellent"];
const SCORE_COLORS = [
    "", 
    "#ef4444", // 1 - red
    "#f97316", // 2 - orange
    "#eab308", // 3 - yellow
    "#22c55e", // 4 - green
    "#00b8d4", // 5 - teal
];

const ScoreSelector: React.FC<ScoreSelectorProps> = ({ label, icon, value, onChange }) => (
    <div
        style={{
            background: "rgba(10, 31, 61, 0.015)",
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            padding: "14px 16px",
            transition: "border-color 0.2s, box-shadow 0.2s",
            ...(value !== null ? {
                borderColor: SCORE_COLORS[value] + "60",
                boxShadow: `0 0 0 3px ${SCORE_COLORS[value]}18`,
            } : {}),
        }}
    >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ color: C.teal, display: "flex", alignItems: "center" }}>{icon}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: "'Inter', sans-serif" }}>
                    {label}
                </span>
            </div>
            {value !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 10px",
                        borderRadius: 100, background: SCORE_COLORS[value] + "18",
                        color: SCORE_COLORS[value], fontFamily: "'Inter', sans-serif",
                    }}>
                        {SCORE_LABELS[value]}
                    </span>
                    <span style={{
                        fontSize: 18, fontWeight: 800, color: SCORE_COLORS[value],
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        {value}/5
                    </span>
                </div>
            )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((score) => (
                <button
                    key={score}
                    type="button"
                    onClick={() => onChange(score)}
                    style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 10,
                        border: "1.5px solid",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.18s",
                        ...(value === score ? {
                            background: SCORE_COLORS[score],
                            borderColor: SCORE_COLORS[score],
                            color: "white",
                            transform: "scale(1.05)",
                            boxShadow: `0 4px 12px ${SCORE_COLORS[score]}40`,
                        } : {
                            background: "#ffffff",
                            borderColor: C.border,
                            color: C.body,
                        }),
                    }}
                    onMouseEnter={e => {
                        if (value !== score) {
                            (e.currentTarget as HTMLElement).style.borderColor = SCORE_COLORS[score];
                            (e.currentTarget as HTMLElement).style.color = SCORE_COLORS[score];
                            (e.currentTarget as HTMLElement).style.background = SCORE_COLORS[score] + "18";
                        }
                    }}
                    onMouseLeave={e => {
                        if (value !== score) {
                            (e.currentTarget as HTMLElement).style.borderColor = C.border;
                            (e.currentTarget as HTMLElement).style.color = C.body;
                            (e.currentTarget as HTMLElement).style.background = "#ffffff";
                        }
                    }}
                >
                    {score}
                </button>
            ))}
        </div>
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast: React.FC<{
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}> = ({ message, type = "success", onClose }) => (
    <div style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999,
        animation: "tl-toast-slide 0.35s cubic-bezier(0.22,1,0.36,1)",
    }}>
        <style>{`@keyframes tl-toast-slide { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(10, 31, 61, 0.95)", borderRadius: 16, padding: "14px 20px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
            border: `1px solid ${type === "success" ? "#10b981" : "#ef4444"}`,
            minWidth: 300, fontFamily: "'Inter', sans-serif",
            backdropFilter: "blur(10px)",
        }}>
            <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            }}>
                {type === "success"
                    ? <CheckCircle2 size={16} color="#10b981" />
                    : <AlertCircle size={16} color="#ef4444" />}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "white" }}>{message}</p>
            </div>
            <button onClick={onClose} style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.muted, padding: 4, display: "flex", alignItems: "center",
            }}>
                <X size={15} />
            </button>
        </div>
    </div>
);

// ─── Risk badge ───────────────────────────────────────────────────────────────
const RiskBadge: React.FC<{ level: "Low" | "Moderate" | "High" }> = ({ level }) => {
    const cfg = {
        Low:      { bg: "rgba(16,185,129,0.1)",  color: "#059669", dot: "#10b981" },
        Moderate: { bg: "rgba(245,158,11,0.1)",  color: "#d97706", dot: "#f59e0b" },
        High:     { bg: "rgba(239,68,68,0.1)",   color: "#dc2626", dot: "#ef4444" },
    }[level];
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 100,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif",
            border: `1px solid ${cfg.dot}30`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
            {level} Risk
        </span>
    );
};

// ─── Avatar initials ─────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 44 }) => {
    const initials = name.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase()).join("");
    const colors = ["#00b8d4", "#1565c0", "#7c3aed", "#16a34a", "#f97316", "#e11d48"];
    const colorIdx = name.charCodeAt(0) % colors.length;
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${colors[colorIdx]}, ${colors[(colorIdx + 1) % colors.length]})`,
            fontSize: size * 0.35, fontWeight: 800, color: "white",
            fontFamily: "'Inter', sans-serif",
            boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
        }}>
            {initials || "?"}
        </div>
    );
};

// ─── Main page ────────────────────────────────────────────────────────────────
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
    const [submittedCount, setSubmittedCount] = useState(0);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const allScoresFilled = [reliabilityScore, communicationScore, commitmentScore, rehireScore, offerOutcomeScore].every(v => v !== null);
    const totalScore = allScoresFilled
        ? Math.round(((reliabilityScore! + communicationScore! + commitmentScore! + rehireScore! + offerOutcomeScore!) / 25) * 100)
        : null;

    // Fetch all candidates
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (applicationId) {
                    const res = await API.getHrFeedbackApplication(applicationId);
                    setSelectedCandidate(res.data);
                    setCandidates([]);
                } else {
                    const res = await API.getAllTrackedTrustScores();
                    const filtered = (res.data || []).filter(
                        (c: TrustLayerDashboardItem) => !c.hrFeedbackSubmitted
                    );
                    setCandidates(filtered);
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to fetch candidates.", "error");
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

    const handleSubmit = async () => {
        if (!selectedCandidate || !allScoresFilled) {
            showToast("Please fill all scores before submitting.", "error");
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
            setCandidates(prev => prev.filter(c => c.applicationId !== selectedCandidate.applicationId));
            setSelectedCandidate(null);
            setReliabilityScore(null);
            setCommunicationScore(null);
            setCommitmentScore(null);
            setRehireScore(null);
            setOfferOutcomeScore(null);
            setComments("");
            setSubmittedCount(n => n + 1);
            showToast(`✅ Feedback submitted — HR Score: ${res.data.hrScore}%`, "success");
        } catch (err: any) {
            showToast(err?.response?.data?.error || "Failed to submit HR feedback.", "error");
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleSendEmail = async (c: TrustLayerDashboardItem) => {
        setLoadingEmail(c.applicationId);
        const prevEmployer = c.candidate.previousEmployments?.[0];
        const hrEmail = prevEmployer?.hrEmail || "No HR Email Found";
        const hrName = prevEmployer?.hrName || "HR Manager";
        try {
            await sendHrEmail(c.applicationId, { hrEmail, hrName, candidateName: c.candidate.name });
            showToast("HR email sent successfully!", "success");
        } catch (err: any) {
            showToast(err?.response?.data?.error || "Failed to send email.", "error");
        } finally {
            setLoadingEmail(null);
        }
    };

    // ─── Loading ────────────────────────────────────────────────────────────
    if (loadingCandidates) return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: 400, gap: 16, fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Loader2 size={26} color={C.teal} style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
            <p style={{ color: C.muted, fontSize: 14, fontWeight: 500, margin: 0 }}>Loading candidates…</p>
        </div>
    );

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", padding: "4px 0", maxWidth: 1100, margin: "0 auto" }}>
            <style>{`
                @keyframes tl-slide-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes tl-modal-in { from { opacity:0; transform:scale(0.95) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes tl-spin { to { transform: rotate(360deg); } }
                .tl-card-row:hover { background: rgba(0, 184, 212, 0.04) !important; box-shadow: 0 6px 20px rgba(10, 31, 61, 0.04) !important; transform: translateY(-1px); border-color: rgba(0, 184, 212, 0.2) !important; }
                .tl-email-btn:hover:not(:disabled) { background: linear-gradient(135deg,${C.teal},${C.tealDark}) !important; color: white !important; border-color: transparent !important; }
                .tl-feedback-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,184,212,0.3) !important; }
            `}</style>

            {/* ── Page header ── */}
            <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                marginBottom: 28, flexWrap: "wrap", gap: 16,
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,184,212,0.30)",
                        }}>
                            <ClipboardList size={19} color="white" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>
                                HR Feedback
                            </h1>
                            <p style={{ margin: 0, fontSize: 12.5, color: C.muted, marginTop: 1 }}>
                                Review candidates and submit evaluations
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats pills */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: C.white, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: "8px 16px",
                        boxShadow: "0 4px 20px rgba(10, 31, 61, 0.04)",
                        backdropFilter: "blur(10px)",
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: "rgba(0,184,212,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Users size={14} color={C.teal} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pending</p>
                            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{filteredCandidates.length}</p>
                        </div>
                    </div>
                    {submittedCount > 0 && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)",
                            borderRadius: 12, padding: "8px 16px",
                            backdropFilter: "blur(10px)",
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: "rgba(22,163,74,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <CheckCircle2 size={14} color="#4ade80" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 10, color: "#4ade80", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Submitted</p>
                                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#4ade80", lineHeight: 1 }}>{submittedCount}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Empty state ── */}
            {filteredCandidates.length === 0 && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "72px 24px", background: C.white, borderRadius: 20,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 24px rgba(10, 31, 61, 0.04)",
                    backdropFilter: "blur(10px)",
                    animation: "tl-slide-up 0.4s ease",
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: "50%", marginBottom: 20,
                        background: "linear-gradient(135deg, rgba(0,184,212,0.15), rgba(0,184,212,0.05))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 0 16px rgba(0,184,212,0.04)",
                    }}>
                        <CheckCircle2 size={32} color={C.teal} />
                    </div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: C.navy }}>
                        All Caught Up!
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: C.muted, textAlign: "center", maxWidth: 320 }}>
                        {searchQuery
                            ? `No candidates match "${searchQuery}"`
                            : "All HR feedback has been submitted. Great work!"}
                    </p>
                </div>
            )}

            {/* ── Candidate cards ── */}
            {filteredCandidates.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filteredCandidates.map((c, i) => {
                        const isEmailLoading = loadingEmail === c.applicationId;
                        return (
                            <div
                                key={c.applicationId}
                                className="tl-card-row"
                                style={{
                                    display: "flex", alignItems: "center", gap: 16,
                                    padding: "16px 20px",
                                    background: C.white,
                                    borderRadius: 18,
                                    border: `1px solid ${C.border}`,
                                    boxShadow: "0 4px 20px rgba(10, 31, 61, 0.04)",
                                    backdropFilter: "blur(10px)",
                                    transition: "all 0.2s ease",
                                    animation: `tl-slide-up 0.35s ease ${i * 0.04}s both`,
                                    cursor: "default",
                                }}
                            >
                                {/* Avatar */}
                                <Avatar name={c.candidate.name} size={48} />

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>
                                            {c.candidate.name}
                                        </span>
                                        <RiskBadge level={(c.riskLevel as any) || "Low"} />
                                    </div>
                                    <div style={{ fontSize: 12.5, color: C.body, marginBottom: 4 }}>
                                        {c.candidate.email}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                        {c.candidate.jobTitle && c.candidate.jobTitle !== "N/A" && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: C.muted }}>
                                                <Briefcase size={11} />
                                                {c.candidate.jobTitle}
                                            </span>
                                        )}
                                        {c.candidate.department && c.candidate.department !== "N/A" && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: C.muted }}>
                                                <Building2 size={11} />
                                                {c.candidate.department}
                                            </span>
                                        )}
                                        <span style={{
                                            display: "flex", alignItems: "center", gap: 4,
                                            fontSize: 11.5, fontWeight: 700, color: C.teal,
                                        }}>
                                            <Star size={11} fill={C.teal} />
                                            Trust: {c.finalTrustScore}%
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                                    <button
                                        className="tl-email-btn"
                                        onClick={() => handleSendEmail(c)}
                                        disabled={isEmailLoading}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 7,
                                            padding: "9px 16px", borderRadius: 12,
                                            border: `1px solid ${C.border}`,
                                            background: "rgba(10, 31, 61, 0.03)", color: C.body,
                                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                                            transition: "all 0.2s",
                                            fontFamily: "'Inter', sans-serif",
                                            opacity: isEmailLoading ? 0.65 : 1,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {isEmailLoading
                                            ? <Loader2 size={13} style={{ animation: "tl-spin 0.8s linear infinite" }} />
                                            : <Send size={13} />}
                                        {isEmailLoading ? "Sending…" : "Send Email"}
                                    </button>

                                    <button
                                        className="tl-feedback-btn"
                                        onClick={() => setSelectedCandidate(c)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 7,
                                            padding: "9px 18px", borderRadius: 12,
                                            border: "none",
                                            background: "linear-gradient(135deg, #00b8d4, #1565c0)",
                                            color: "white",
                                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                                            transition: "all 0.2s",
                                            fontFamily: "'Inter', sans-serif",
                                            boxShadow: "0 4px 12px rgba(0,184,212,0.25)",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <MessageSquare size={13} />
                                        Submit Feedback
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Feedback Modal ── */}
            {selectedCandidate && (
                <div
                    onClick={() => setSelectedCandidate(null)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 50,
                        background: "rgba(10, 31, 61, 0.4)", backdropFilter: "blur(8px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 16,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "linear-gradient(135deg, #FFFFFF 0%, #F4F8FD 100%)", borderRadius: 24,
                            width: "100%", maxWidth: 580,
                            maxHeight: "90vh", overflowY: "auto",
                            boxShadow: "0 32px 80px rgba(10, 31, 61, 0.15), 0 8px 24px rgba(10, 31, 61, 0.1)",
                            border: "1px solid #e2eaf3",
                            animation: "tl-modal-in 0.35s cubic-bezier(0.22,1,0.36,1)",
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(10,31,61,0.1) transparent",
                        }}
                    >
                        {/* Modal header */}
                        <div style={{
                            padding: "22px 24px 18px",
                            borderBottom: `1px solid ${C.border}`,
                            display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
                            position: "sticky", top: 0, background: "rgba(255, 255, 255, 0.95)", zIndex: 5, borderRadius: "24px 24px 0 0",
                            backdropFilter: "blur(10px)",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <Avatar name={selectedCandidate.candidate.name} size={52} />
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.navy, letterSpacing: "-0.01em" }}>
                                            {selectedCandidate.candidate.name}
                                        </h2>
                                        <RiskBadge level={(selectedCandidate.riskLevel as any) || "Low"} />
                                    </div>
                                    <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.muted }}>
                                        {selectedCandidate.candidate.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    border: `1px solid ${C.border}`, background: "rgba(10,31,61,0.03)",
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    color: C.muted, transition: "all 0.15s",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(10,31,61,0.03)"; (e.currentTarget as HTMLElement).style.color = C.muted; }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ padding: "20px 24px 24px" }}>
                            {/* Candidate details */}
                            <div style={{
                                background: "rgba(0,184,212,0.05)",
                                borderRadius: 16, padding: "14px 16px", marginBottom: 20,
                                border: "1px solid rgba(0,184,212,0.15)",
                            }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                                    {[
                                        { icon: <Briefcase size={12} />, text: selectedCandidate.candidate.jobTitle },
                                        { icon: <Building2 size={12} />, text: selectedCandidate.candidate.department },
                                        { icon: <Clock size={12} />, text: `${selectedCandidate.candidate.yearsOfExperience ?? 0} yrs exp` },
                                        { icon: <Star size={12} fill={C.teal} />, text: `Trust: ${selectedCandidate.finalTrustScore}%` },
                                    ].filter(i => i.text && i.text !== "N/A").map(item => (
                                        <span key={item.text} style={{
                                            display: "flex", alignItems: "center", gap: 5,
                                            fontSize: 12, color: C.navy, fontWeight: 600,
                                            background: "#ffffff", borderRadius: 8, padding: "4px 10px",
                                            border: "1px solid rgba(0,184,212,0.2)",
                                        }}>
                                            <span style={{ color: C.teal }}>{item.icon}</span>
                                            {item.text}
                                        </span>
                                    ))}
                                </div>

                                {/* Previous employments */}
                                {(selectedCandidate.candidate.previousEmployments ?? []).length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                            Previous Employers
                                        </p>
                                        {(selectedCandidate.candidate.previousEmployments ?? []).map((job, idx) => (
                                            <div key={idx} style={{
                                                background: "#ffffff", borderRadius: 12, padding: "10px 14px",
                                                border: `1px solid ${C.border}`,
                                                display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{job.companyName}</div>
                                                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                                                        {job.employmentStartDate} – {job.employmentEndDate ?? "Present"}
                                                    </div>
                                                    {job.consentToContact && (
                                                        <div style={{ fontSize: 11.5, color: C.body, marginTop: 4 }}>
                                                            <span style={{ fontWeight: 600 }}>HR:</span> {job.hrName} · {job.hrEmail}
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 100, whiteSpace: "nowrap",
                                                    ...(job.consentToContact
                                                        ? { background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }
                                                        : { background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)" }),
                                                }}>
                                                    {job.consentToContact ? "✓ Contact OK" : "✗ No Contact"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Score selectors */}
                            <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Evaluation Scores
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                                <ScoreSelector label="Reliability" icon={<ShieldCheck size={14} />} value={reliabilityScore} onChange={setReliabilityScore} />
                                <ScoreSelector label="Communication" icon={<MessageSquare size={14} />} value={communicationScore} onChange={setCommunicationScore} />
                                <ScoreSelector label="Commitment" icon={<UserCheck size={14} />} value={commitmentScore} onChange={setCommitmentScore} />
                                <ScoreSelector label="Rehire Potential" icon={<Users size={14} />} value={rehireScore} onChange={setRehireScore} />
                                <ScoreSelector label="Offer Outcome" icon={<CheckCircle2 size={14} />} value={offerOutcomeScore} onChange={setOfferOutcomeScore} />
                            </div>

                            {/* Score preview */}
                            {totalScore !== null && (
                                <div style={{
                                    background: `linear-gradient(135deg, ${C.teal}15, ${C.blue}10)`,
                                    borderRadius: 14, padding: "12px 16px", marginBottom: 16,
                                    border: `1px solid rgba(0,184,212,0.25)`,
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>Projected HR Score</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: "50%",
                                            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: "white", fontSize: 12, fontWeight: 800,
                                        }}>
                                            {totalScore}
                                        </div>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: C.teal }}>{totalScore}%</span>
                                    </div>
                                </div>
                            )}

                            {/* Comments */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: "block", fontSize: 11, fontWeight: 800, color: C.body,
                                    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
                                }}>
                                    Additional Comments
                                </label>
                                <textarea
                                    rows={3}
                                    value={comments}
                                    onChange={e => setComments(e.target.value)}
                                    placeholder="Add notes about this candidate's performance and behaviour…"
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: "12px 14px",
                                        background: "#ffffff", border: `1px solid ${C.border}`,
                                        borderRadius: 12, fontSize: 13, color: C.navy,
                                        outline: "none", resize: "none", fontFamily: "'Inter', sans-serif",
                                        transition: "border-color 0.15s, box-shadow 0.15s",
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = C.teal;
                                        e.target.style.boxShadow = "0 0 0 3px rgba(0,184,212,0.15)";
                                        e.target.style.background = "#ffffff";
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = C.border;
                                        e.target.style.boxShadow = "none";
                                        e.target.style.background = "#ffffff";
                                    }}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={loadingSubmit || !allScoresFilled}
                                style={{
                                    width: "100%", padding: "14px 24px",
                                    background: !allScoresFilled
                                        ? "rgba(10,31,61,0.05)"
                                        : "linear-gradient(135deg, #00b8d4, #1565c0)",
                                    color: !allScoresFilled ? C.muted : "white",
                                    border: "none", borderRadius: 14,
                                    fontSize: 15, fontWeight: 700, cursor: allScoresFilled ? "pointer" : "not-allowed",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: "all 0.2s", fontFamily: "'Inter', sans-serif",
                                    boxShadow: allScoresFilled ? "0 4px 16px rgba(0,184,212,0.3)" : "none",
                                    opacity: loadingSubmit ? 0.7 : 1,
                                }}
                            >
                                {loadingSubmit
                                    ? <><Loader2 size={16} style={{ animation: "tl-spin 0.8s linear infinite" }} /> Submitting…</>
                                    : !allScoresFilled
                                    ? <><AlertCircle size={16} /> Fill all scores to continue</>
                                    : <><CheckCircle2 size={16} /> Submit HR Feedback</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default HrFeedbackPage;
