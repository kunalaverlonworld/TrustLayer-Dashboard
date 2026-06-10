import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import LoginPage from "../pages/Login";
import SSOPage from "../pages/SSO";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Dashboard from "../components/dashboard/Dashboard";
import HrFeedbackPage from "../pages/HrFeedback";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PlanProtectedRoute from "../components/auth/PlanProtectedRoute";
import EmployeesPage from "../pages/EmployeesPage";
import EmployeeProfilePage from "../pages/EmployeeProfilePage";

const AppRouter: React.FC = () => {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>

                {/* Public Routes */}
                <Route path="/"      element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/sso"   element={<SSOPage />} />    {/* ← SSO auto-login */}
                <Route path="/hr-feedback/:applicationId" element={<HrFeedbackPage />} />

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/hr-feedback" element={<HrFeedbackPage />} />
                        <Route path="/dashboard/employees" element={<EmployeesPage />} />
                        <Route path="/employees/profile/:employeeId" element={<EmployeeProfilePage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
