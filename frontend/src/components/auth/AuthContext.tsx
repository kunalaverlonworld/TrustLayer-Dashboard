import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { API } from "../../api/api";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    companyName?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUser = async () => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Uses /api/auth/me — verifies JWT and returns user from DB
            const response = await API.getMe();

            // Handle both { user: {...} } and { success: true, user: {...} } shapes
            const userData = response.data?.user ?? response.data;
            const planName = response.data?.planName;

            if (planName) {
                sessionStorage.setItem("plan", planName);
            }

            if (!userData || !userData._id) {
                // Token valid but no user found — clear session
                console.warn("[AuthContext] Token valid but user not found in response");
                sessionStorage.removeItem("token");
                setUser(null);
            } else {
                setUser(userData as User);
            }
        } catch (err: any) {
            // Network error — don't logout, just set user null and let UI handle
            if (err.isNetworkError) {
                console.warn("[AuthContext] Network error fetching user — will retry on next action");
                setUser(null);
            } else {
                // 401/403 — token invalid, clear session
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("plan");
                sessionStorage.removeItem("licenseId");
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("plan");
        sessionStorage.removeItem("licenseId");
        setUser(null);
        // Redirect to landing page and signal it to clear its own session
        const landingUrl = import.meta.env.VITE_LANDING_URL || "https://trustlayer-by3p.onrender.com";
        window.location.href = `${landingUrl}?loggedOut=1`;
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, logout, refreshUser: fetchUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};
