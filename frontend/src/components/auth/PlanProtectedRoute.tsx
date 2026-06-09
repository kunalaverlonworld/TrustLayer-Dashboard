import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface PlanProtectedRouteProps {
    allowedPlans: string[];
    fallbackPath?: string;
}

const PlanProtectedRoute: React.FC<PlanProtectedRouteProps> = ({
    allowedPlans,
    fallbackPath = "/dashboard",
}) => {
    const plan = localStorage.getItem("plan")?.toLowerCase() ?? "basic";

    if (!allowedPlans.includes(plan)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <Outlet />;
};

export default PlanProtectedRoute;
