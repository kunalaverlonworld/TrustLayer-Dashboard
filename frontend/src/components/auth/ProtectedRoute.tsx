// src/components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    // While fetching /users/me
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <span className="text-gray-500 text-sm">Loading...</span>
            </div>
        );
    }

    // If no authenticated user
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
