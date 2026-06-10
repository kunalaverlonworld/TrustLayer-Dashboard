// src/components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ShieldCheck } from "lucide-react";

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    // While verifying token with backend
    if (loading) {
        return (
            <div
                className="h-screen flex flex-col items-center justify-center gap-4"
                style={{
                    background: "linear-gradient(135deg, #f0f4ff 0%, #f8faff 100%)",
                    fontFamily: "'Inter', sans-serif",
                }}
            >
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
                    <p className="font-bold text-[#0a1f3d] text-sm">Verifying session</p>
                    <p className="text-slate-400 text-xs mt-1">Please wait...</p>
                </div>
            </div>
        );
    }

    // Not authenticated — redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
