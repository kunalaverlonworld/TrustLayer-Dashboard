// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/api";
import { useAuth } from "../components/auth/AuthContext";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await API.login(email, password);
            const { token, planName } = res.data;

            // Store token
            sessionStorage.setItem("token", token);
            if (planName) {
                sessionStorage.setItem("plan", planName);
            }

            // Refresh global auth state
            await refreshUser();

            // Redirect after user is set
            navigate("/dashboard");
        } catch (err: any) {
            setError(
                err?.response?.data?.message || "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8">

                <h2 className="text-2xl font-semibold text-center">
                    Sign In
                </h2>

                <p className="text-sm text-gray-500 text-center mt-1">
                    Access your TrustLayer dashboard
                </p>

                <form onSubmit={handleLogin} className="mt-6 space-y-5">

                    <div>
                        <label className="text-sm text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
