// src/pages/ShareCandidatePage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../api/api";
import { TrustExplainResponse } from "../types/types";
import { ShieldCheck, BarChart3, ClipboardList, Clock, CheckCircle, Mail, Briefcase, Building2, AlertTriangle, AlertCircle } from "lucide-react";

const C = {
    navy:      "#0a1f3d",
    navyMid:   "#0d2d5e",
    teal:      "#00b8d4",
    tealDark:  "#0097b2",
    tealLight: "rgba(0,184,212,0.08)",
    blue:      "#1565c0",
    body:      "#475569",
    muted:     "#94a3b8",
    border:    "#e2eaf3",
    white:     "#ffffff",
};

export default function ShareCandidatePage() {
    const { applicationId } = useParams<{ applicationId: string }>();
    const [details, setDetails] = useState<TrustExplainResponse & { candidate?: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!applicationId) return;
            try {
                // Get explain values and candidate info
                const [explainRes, detailsRes] = await Promise.all([
                    API.getTrustExplain(applicationId),
                    API.getHrFeedbackApplication(applicationId).catch(() => ({ data: null }))
                ]);
                
                setDetails({
                    ...explainRes.data,
                    candidate: detailsRes?.data?.candidate || null
                });
            } catch (err) {
                console.error(err);
                setError("Failed to generate shareable candidate report.");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [applicationId]);

    const getTrustScoreColor = (score: number) => {
        if (score >= 75) return "#10b981";
        if (score >= 45) return "#f59e0b";
        return "#ef4444";
    };

    if (loading) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                minHeight: "100vh", gap: 16, fontFamily: "'Inter', sans-serif", background: "#f8fafc"
            }}>
                <div style={{
                    width: 50, height: 50, borderRadius: "50%",
                    border: "3px solid rgba(0,184,212,0.15)",
                    borderTop: "3px solid #00b8d4",
                    animation: "spin 0.8s linear infinite"
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: C.muted, fontSize: 14, fontWeight: 500 }}>Loading Candidate Report...</p>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                minHeight: "100vh", gap: 16, fontFamily: "'Inter', sans-serif", background: "#f8fafc", padding: 24
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: "#fff5f5",
                    display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #fee2e2"
                }}>
                    <AlertCircle size={28} color="#ef4444" />
                </div>
                <h3 style={{ margin: 0, color: C.navy, fontSize: 18, fontWeight: 800 }}>Error Loading Report</h3>
                <p style={{ margin: 0, color: C.muted, fontSize: 13, textAlign: "center" }}>{error || "Report not found or has expired."}</p>
            </div>
        );
    }

    const candidate = details.candidate;
    const score = details.finalTrustScore;
    const timeline = (details as any).timeline || [];

    return (
        <div style={{
            background: "#f8fafc",
            minHeight: "100vh",
            fontFamily: "'Inter', sans-serif",
            padding: "40px 16px"
        }}>
            <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
                
                {/* Header Card */}
                <div style={{
                    background: C.white, borderRadius: 24, padding: "24px 32px",
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(10, 31, 61, 0.03)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                background: "rgba(0,184,212,0.1)", border: "1px solid rgba(0,184,212,0.2)",
                                color: C.teal, fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                                padding: "3px 10px", borderRadius: 100, letterSpacing: "0.06em"
                            }}>
                                <ShieldCheck size={11} /> Verified Report
                            </div>
                        </div>
                        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>
                            {candidate?.name || "Candidate Profile"}
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: C.body, display: "flex", alignItems: "center", gap: 5 }}>
                            <Mail size={12} color={C.muted} /> {candidate?.email || "N/A"}
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Trust Score
                            </span>
                            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: getTrustScoreColor(score) }}>
                                {score.toFixed(1)}%
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Main Details Panel */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                    
                    {/* Score Gauges */}
                    <div style={{
                        background: C.white, borderRadius: 24, padding: 24,
                        border: `1px solid ${C.border}`,
                        boxShadow: "0 4px 20px rgba(10, 31, 61, 0.03)",
                        display: "flex", flexDirection: "column", gap: 20
                    }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.navy, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <BarChart3 size={16} color={C.teal} /> Verification Breakdown
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Interaction */}
                            <div style={{ background: "rgba(10,31,61,0.015)", border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>Engagement Score</span>
                                    <span style={{ fontSize: 12.5, fontWeight: 800, color: C.teal }}>
                                        {details.components.interaction?.averageNormalizedScore.toFixed(1)}%
                                    </span>
                                </div>
                                <div style={{ height: 6, width: "100%", background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", borderRadius: 10, background: C.teal,
                                        width: `${details.components.interaction?.averageNormalizedScore}%`
                                    }} />
                                </div>
                            </div>

                            {/* Reference Check */}
                            {details.components.hrFeedback ? (
                                <div style={{ background: "rgba(10,31,61,0.015)", border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>Employer Reference Score</span>
                                        <span style={{ fontSize: 12.5, fontWeight: 800, color: C.blue }}>
                                            {details.components.hrFeedback.calculatedHrScore.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div style={{ height: 6, width: "100%", background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", borderRadius: 10, background: C.blue,
                                            width: `${details.components.hrFeedback.calculatedHrScore}%`
                                        }} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    border: `1.5px dashed ${C.border}`, borderRadius: 16, padding: 20,
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center"
                                }}>
                                    <ClipboardList size={20} color={C.muted} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>HR Feedback Awaiting Submission</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div style={{
                        background: C.white, borderRadius: 24, padding: 24,
                        border: `1px solid ${C.border}`,
                        boxShadow: "0 4px 20px rgba(10, 31, 61, 0.03)",
                        display: "flex", flexDirection: "column", gap: 16
                    }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.navy, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <Briefcase size={16} color={C.teal} /> Candidate Placement
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Role Title</span>
                                <span style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>{candidate?.jobTitle || "—"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Department</span>
                                <span style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>{candidate?.department || "—"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Experience Level</span>
                                <span style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>{candidate?.yearsOfExperience ? `${candidate.yearsOfExperience} years` : "—"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Risk Tier</span>
                                <span style={{
                                    fontSize: 12, color: getTrustScoreColor(score), fontWeight: 800, textTransform: "uppercase"
                                }}>{details.riskLevel} Risk</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validation Timeline Card */}
                <div style={{
                    background: C.white, borderRadius: 24, padding: "28px 32px",
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(10, 31, 61, 0.03)"
                }}>
                    <h3 style={{ margin: "0 0 24px", fontSize: 14, fontWeight: 800, color: C.navy, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <Clock size={16} color={C.teal} /> Verification Audit Log
                    </h3>

                    {timeline.length === 0 ? (
                        <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>No logs recorded yet.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            {timeline.map((event: any, idx: number) => (
                                <div key={idx} style={{ display: "flex", gap: 16, position: "relative" }}>
                                    
                                    {/* Timeline line */}
                                    {idx < timeline.length - 1 && (
                                        <div style={{
                                            position: "absolute", left: 15, top: 24, bottom: -24,
                                            width: 2, background: C.border
                                        }} />
                                    )}

                                    {/* Indicator Bullet */}
                                    <div style={{
                                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                                        background: event.type === "ghosting" ? "#fff5f5" : event.type === "feedback" ? "#f0fdf4" : C.tealLight,
                                        border: `1px solid ${event.type === "ghosting" ? "#fee2e2" : event.type === "feedback" ? "#bbf7d0" : "rgba(0,184,212,0.25)"}`,
                                    }}>
                                        {event.type === "ghosting" ? (
                                            <AlertTriangle size={14} color="#ef4444" />
                                        ) : event.type === "feedback" ? (
                                            <CheckCircle size={14} color="#10b981" />
                                        ) : (
                                            <ShieldCheck size={14} color={C.teal} />
                                        )}
                                    </div>

                                    {/* Event text */}
                                    <div>
                                        <h4 style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 700, color: C.navy }}>
                                            {event.title}
                                        </h4>
                                        <p style={{ margin: "0 0 6px", fontSize: 12.5, color: C.body, lineHeight: 1.4 }}>
                                            {event.description}
                                        </p>
                                        <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 600 }}>
                                            {new Date(event.timestamp).toLocaleString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
