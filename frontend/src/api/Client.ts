import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// -----------------------------
// REQUEST INTERCEPTOR
// -----------------------------
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

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
        const status = error.response?.status;

        if (status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect to login safely
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        if (status === 403) {
            console.warn("Forbidden: insufficient permissions");
        }

        if (status >= 500) {
            console.error("Server error");
        }

        return Promise.reject(error);
    }
);
