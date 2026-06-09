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
                <div className="relative">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,184,212,0.1), rgba(21,101,192,0.1))",
                        }}
                    >
                        <ShieldCheck className="w-7 h-7 text-[#00b8d4]" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-2 border-[#e2eaf3] border-t-[#00b8d4] rounded-full animate-spin" />
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
