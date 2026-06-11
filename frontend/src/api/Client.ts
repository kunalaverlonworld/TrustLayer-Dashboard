import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    timeout: 30000, // increased from 15s — backend calls external APIs which can be slow
    headers: {
        "Content-Type": "application/json",
    },
});

// -----------------------------
// REQUEST INTERCEPTOR
// -----------------------------
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// -----------------------------
// RESPONSE INTERCEPTOR
// -----------------------------
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Network/timeout error (no response at all)
        if (!error.response) {
            const networkErr = new Error(
                "Unable to connect to the server. Please check your connection or try again."
            );
            (networkErr as any).isNetworkError = true;
            return Promise.reject(networkErr);
        }

        const status = error.response?.status;

        if (status === 401) {
            // Token expired or invalid — clear session and redirect
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("plan");
            sessionStorage.removeItem("licenseId");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        if (status === 403) {
            console.warn("[API] Forbidden: insufficient permissions for this request.");
        }

        if (status >= 500) {
            console.error("[API] Server error:", error.response?.data?.message || "Internal server error");
        }

        return Promise.reject(error);
    }
);
