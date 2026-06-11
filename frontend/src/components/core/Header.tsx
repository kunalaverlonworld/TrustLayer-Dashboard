// src/components/core/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, X, User, CreditCard, LogOut, ChevronDown, Settings, Menu } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../../api/api";


function getInitials(name?: string): string {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
}

function getAvatarGradient(name?: string): string {
    if (!name) return "linear-gradient(135deg,#64748b,#475569)";
    const gradients = [
        "linear-gradient(135deg,#00b8d4,#1565c0)",
        "linear-gradient(135deg,#7c3aed,#4f46e5)",
        "linear-gradient(135deg,#059669,#0d9488)",
        "linear-gradient(135deg,#d97706,#dc2626)",
        "linear-gradient(135deg,#db2777,#9333ea)",
        "linear-gradient(135deg,#0284c7,#6366f1)",
    ];
    const index =
        name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        gradients.length;
    return gradients[index];
}

interface HeaderProps {
    onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
    const { user, logout } = useAuth();
    const { searchQuery, setSearchQuery } = useSearch();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showProfile, setShowProfile]   = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Fetch candidate and employee lists for suggestions
    const loadSuggestions = async () => {
        if (!user || suggestions.length > 0 || isLoadingSuggestions) return;
        setIsLoadingSuggestions(true);
        try {
            const [candidatesRes, employeesRes] = await Promise.all([
                API.getAllTrackedTrustScores().catch(() => ({ data: [] })),
                API.getAllEmployees().catch(() => ({ data: { data: [] } }))
            ]);

            const candidateItems = (candidatesRes.data || []).map(item => ({
                id: item.applicationId,
                name: item.candidate?.name || "Unknown",
                email: item.candidate?.email || "",
                subtitle: item.candidate?.jobTitle || "Candidate",
                department: item.candidate?.department || "",
                location: item.candidate?.location || "",
                riskLevel: item.riskLevel || "",
                type: "candidate" as const
            }));

            const employeeItems = (employeesRes.data?.data || []).map((item: any) => ({
                id: item._id || item.employeeId,
                name: item.name || "Unknown",
                email: item.email || "",
                subtitle: item.designation || item.department || "Employee",
                department: item.department || "",
                location: item.location || "",
                riskLevel: "",
                type: "employee" as const
            }));

            setSuggestions([...candidateItems, ...employeeItems]);
        } catch (err) {
            console.error("Failed to load search suggestions:", err);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Load suggestions on mount/auth change
    useEffect(() => {
        if (user) {
            loadSuggestions();
        }
    }, [user]);

    // Close suggestions dropdown on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filteredSuggestions = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return suggestions.filter(
            item =>
                item.name.toLowerCase().includes(query) ||
                item.email.toLowerCase().includes(query) ||
                item.subtitle.toLowerCase().includes(query) ||
                item.department.toLowerCase().includes(query) ||
                item.location.toLowerCase().includes(query) ||
                item.riskLevel.toLowerCase().includes(query)
        ).slice(0, 5);
    }, [searchQuery, suggestions]);

    const initials       = getInitials(user?.name);
    const avatarGradient = getAvatarGradient(user?.name);
    const plan           = sessionStorage.getItem("plan") || "";

    const now = new Date();
    const timeString = now.toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const menuItemStyle: React.CSSProperties = {
        width: "100%", textAlign: "left",
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13.5, fontWeight: 500, color: "#475569",
        padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        transition: "background 0.15s",
    };

    const iconBox = (bg: string) => ({
        width: 30, height: 30, borderRadius: 8, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
    } as React.CSSProperties);

    return (
        <>
        <header
            className="w-full sticky top-0 z-40"
            style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid #e2eaf3",
                boxShadow: "0 4px 30px rgba(10, 31, 61, 0.03)",
            }}
        >
            <div className="h-16 px-4 md:px-8 lg:px-10 flex items-center justify-between gap-4">

                {/* Left: Mobile Toggle + Page context */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                        title="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col">
                        <span className="text-[#0a1f3d] font-bold text-sm tracking-tight hidden md:block">
                            Welcome back,{"  "}
                            <span className="text-[#00b8d4]">{user?.name || "User"}</span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium hidden md:block">
                            {timeString}
                        </span>
                    </div>
                </div>

                {/* Center: Search */}
                <div style={{ position: "relative", flex: 1, maxWidth: "448px" }} ref={searchRef}>
                    <div
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                        style={{ background: "rgba(10, 31, 61, 0.03)", border: "1px solid #e2eaf3" }}
                    >
                        <Search size={15} className="text-slate-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={searchQuery}
                            onFocus={() => {
                                setIsSearchFocused(true);
                                loadSuggestions();
                            }}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsSearchFocused(true);
                                loadSuggestions();
                            }}
                            className="bg-transparent outline-none text-sm w-full placeholder-slate-400 text-slate-800"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 transition-colors"
                            >✕</button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {isSearchFocused && filteredSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    marginTop: 8,
                                    background: "white",
                                    borderRadius: 16,
                                    border: "1px solid #e2eaf3",
                                    boxShadow: "0 10px 30px rgba(10,31,61,0.08)",
                                    overflow: "hidden",
                                    zIndex: 50,
                                }}
                            >
                                <div className="max-h-60 overflow-y-auto py-1.5">
                                    <div className="px-4 py-1 text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-[#e2eaf3] mb-1.5">
                                        Suggestions
                                    </div>
                                    {filteredSuggestions.map((item, idx) => (
                                        <button
                                            key={`${item.type}-${item.id}-${idx}`}
                                            onClick={() => {
                                                setSearchQuery(item.name);
                                                setIsSearchFocused(false);
                                            }}
                                            className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-[#edf5fb] transition-colors"
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontFamily: "'Inter', sans-serif"
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0"
                                                    style={{
                                                        background: item.type === "candidate" ? "rgba(0,184,212,0.1)" : "rgba(124,58,237,0.1)",
                                                        color: item.type === "candidate" ? "#00b8d4" : "#7c3aed"
                                                    }}
                                                >
                                                    {item.type === "candidate" ? "Can" : "Emp"}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                                                    <div className="text-[10px] text-slate-400 truncate">
                                                        {item.subtitle}
                                                        {item.department && ` • ${item.department}`}
                                                        {item.location && ` • ${item.location}`}
                                                        {item.riskLevel && ` • ${item.riskLevel} Risk`}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Bell + Profile dropdown */}
                <div className="flex items-center gap-4">

                    {/* Notification bell */}
                    <button
                        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                        style={{ background: "rgba(10, 31, 61, 0.03)", border: "1px solid #e2eaf3" }}
                        title="Notifications"
                    >
                        <Bell size={16} className="text-slate-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>

                    {/* Profile chip + dropdown */}
                    <div ref={dropRef} style={{ position: "relative" }}>
                        <button
                            onClick={() => setDropdownOpen(o => !o)}
                            className="flex items-center gap-3 px-3 py-1.5 rounded-2xl cursor-pointer group transition-all duration-200"
                            style={{
                                background: dropdownOpen ? "#f0f7ff" : "rgba(10, 31, 61, 0.03)",
                                border: "1px solid #e2eaf3",
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: avatarGradient, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                            >
                                {initials}
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                                <span className="text-[#0a1f3d] text-xs font-bold leading-none">
                                    {user?.name || "User"}
                                </span>
                                <span className="text-slate-500 text-[10px] mt-0.5 capitalize font-medium">
                                    {user?.role || "Admin"}
                                </span>
                            </div>
                            <ChevronDown
                                size={13}
                                className="text-slate-500 hidden md:block transition-transform duration-200"
                                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                            />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: "absolute", top: 52, right: 0,
                                        background: "white", borderRadius: 16,
                                        border: "1px solid #e2eaf3",
                                        boxShadow: "0 16px 48px rgba(10,31,61,0.13)",
                                        minWidth: 240, overflow: "hidden", zIndex: 50,
                                    }}
                                >
                                    {/* User header */}
                                    <div style={{
                                        padding: "16px",
                                        background: "linear-gradient(135deg,#f0f7ff,#e8f4fb)",
                                        borderBottom: "1px solid #e2eaf3",
                                        display: "flex", alignItems: "center", gap: 12,
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: "50%",
                                            background: avatarGradient,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0,
                                            boxShadow: "0 4px 12px rgba(0,184,212,0.3)",
                                        }}>{initials}</div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1f3d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {user?.name}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {user?.email || user?.role}
                                            </div>
                                            {plan && (
                                                <div style={{
                                                    marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4,
                                                    background: "linear-gradient(135deg,#00b8d4,#0097b2)",
                                                    color: "white", fontSize: 9, fontWeight: 800,
                                                    padding: "2px 8px", borderRadius: 99, letterSpacing: "0.05em",
                                                }}>
                                                    ✦ {plan.toUpperCase()} PLAN
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div style={{ padding: "6px 0" }}>

                                        {/* My Profile */}
                                        <button
                                            style={menuItemStyle}
                                            onClick={() => { setDropdownOpen(false); setShowProfile(true); }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#edf5fb")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                        >
                                            <div style={iconBox("#f0f7ff")}><User size={14} color="#00b8d4" /></div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: "#0a1f3d" }}>My Profile</div>
                                                <div style={{ fontSize: 11, color: "#94a3b8" }}>View account details</div>
                                            </div>
                                        </button>

                                        {/* Settings */}
                                        <button
                                            style={menuItemStyle}
                                            onClick={() => setDropdownOpen(false)}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#edf5fb")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                        >
                                            <div style={iconBox("#f8fafc")}><Settings size={14} color="#64748b" /></div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: "#0a1f3d" }}>Settings</div>
                                                <div style={{ fontSize: 11, color: "#94a3b8" }}>Preferences &amp; config</div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Sign out */}
                                    <div style={{ borderTop: "1px solid #e2eaf3", padding: "6px 0" }}>
                                        <button
                                            style={{ ...menuItemStyle, color: "#ef4444" }}
                                            onClick={() => { setDropdownOpen(false); logout(); }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                        >
                                            <div style={iconBox("#fff5f5")}><LogOut size={14} color="#ef4444" /></div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>Sign Out</div>
                                                <div style={{ fontSize: 11, color: "#fca5a5" }}>Return to landing page</div>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>

        {/* ── Profile Modal ──────────────────────────────────────────────── */}
        <AnimatePresence>
            {showProfile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowProfile(false)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 200,
                        background: "rgba(10,31,61,0.45)", backdropFilter: "blur(6px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 24, fontFamily: "'Inter', sans-serif",
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "white", borderRadius: 20,
                            boxShadow: "0 24px 80px rgba(10,31,61,0.18)",
                            width: "100%", maxWidth: 420, overflow: "hidden",
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            background: "linear-gradient(135deg,#0a1f3d,#1565c0)",
                            padding: "32px 24px 24px",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                            position: "relative",
                        }}>
                            <button
                                onClick={() => setShowProfile(false)}
                                style={{
                                    position: "absolute", top: 16, right: 16,
                                    background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer",
                                    color: "white", borderRadius: 8, width: 32, height: 32,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                            ><X size={16} /></button>

                            <div style={{
                                width: 72, height: 72, borderRadius: "50%",
                                background: avatarGradient,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 26, fontWeight: 800, color: "white",
                                boxShadow: "0 8px 24px rgba(0,184,212,0.4)",
                                border: "3px solid rgba(255,255,255,0.3)",
                            }}>{initials}</div>

                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{user?.name}</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2, textTransform: "capitalize" }}>
                                    {user?.role}
                                </div>
                            </div>

                            {plan && (
                                <div style={{
                                    background: "linear-gradient(135deg,#00b8d4,#0097b2)",
                                    color: "white", fontSize: 10, fontWeight: 800,
                                    padding: "4px 14px", borderRadius: 99, letterSpacing: "0.08em",
                                    boxShadow: "0 4px 12px rgba(0,184,212,0.4)",
                                }}>
                                    ✦ {plan.toUpperCase()} PLAN
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{ padding: "24px" }}>
                            {[
                                { label: "Full Name",    value: user?.name || "—" },
                                { label: "Role",         value: user?.role || "—" },
                                { label: "Current Plan", value: plan || "No active plan" },
                                { label: "Account ID",   value: user?._id ? `#${user._id.slice(-8).toUpperCase()}` : "—" },
                            ].map(row => (
                                <div key={row.label} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "12px 0", borderBottom: "1px solid #f1f5f9",
                                }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {row.label}
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0a1f3d", maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}

                            <button
                                onClick={() => { setShowProfile(false); logout(); }}
                                style={{
                                    marginTop: 20, width: "100%", padding: "11px", borderRadius: 12, cursor: "pointer",
                                    background: "#fff5f5", border: "1.5px solid #fecdd3",
                                    color: "#ef4444", fontSize: 13, fontWeight: 700,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
}
