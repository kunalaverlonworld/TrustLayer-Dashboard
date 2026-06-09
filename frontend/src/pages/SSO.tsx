// SSO landing page — auto-logs in user coming from TrustLayer landing page
// URL: /sso?token=<jwt>&plan=<planName>&licenseId=<id>
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SSOPage: React.FC = () => {
    const [params]   = useSearchParams();
    const navigate   = useNavigate();

    useEffect(() => {
        const token     = params.get("token");
        const plan      = params.get("plan")      ?? "basic";
        const licenseId = params.get("licenseId") ?? "";

        if (!token) {
            // No token — redirect to login
            navigate("/login", { replace: true });
            return;
        }

        // Store dashboard JWT — same key AuthContext reads
        localStorage.setItem("token",     token);
        localStorage.setItem("plan",      plan);
        localStorage.setItem("licenseId", licenseId);

        // Go to dashboard
        navigate("/dashboard", { replace: true });
    }, []);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a1f3d",
            fontFamily: "'Inter', sans-serif",
            gap: 16,
        }}>
            {/* Spinner */}
            <div style={{
                width: 48, height: 48,
                border: "4px solid rgba(0,184,212,0.2)",
                borderTop: "4px solid #00b8d4",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#90caf9", fontSize: 15, margin: 0 }}>
                Signing you in…
            </p>
        </div>
    );
};

export default SSOPage;
