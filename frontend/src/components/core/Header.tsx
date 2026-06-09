// src/components/core/Header.tsx
import React from "react";
import { Bell, Search, ShieldCheck, ChevronDown } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useSearch } from "../../context/SearchContext";

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

export default function Header() {
    const { user, logout } = useAuth();
    const { searchQuery, setSearchQuery } = useSearch();

    const initials = getInitials(user?.name);
    const avatarGradient = getAvatarGradient(user?.name);

    const now = new Date();
    const timeString = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <header
            className="w-full sticky top-0 z-40"
            style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(226,234,243,0.8)",
                boxShadow: "0 1px 12px rgba(10,31,61,0.04)",
            }}
        >
            <div className="h-16 px-8 lg:px-10 flex items-center justify-between gap-4">

                {/* Left: Page context */}
                <div className="flex flex-col">
                    <span className="text-[#0a1f3d] font-bold text-sm tracking-tight hidden md:block">
                        Welcome back,{" "}
                        <span className="text-[#00b8d4]">{user?.name || "User"}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium hidden md:block">
                        {timeString}
                    </span>
                </div>

                {/* Center: Search */}
                <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1 max-w-md"
                    style={{
                        background: "rgba(241,245,249,0.8)",
                        border: "1px solid rgba(226,234,243,0.9)",
                    }}
                >
                    <Search size={15} className="text-slate-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full placeholder-slate-400 text-[#0a1f3d]"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1 transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Right: Notification + Profile */}
                <div className="flex items-center gap-4">

                    {/* Notification bell */}
                    <button
                        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                        style={{
                            background: "rgba(241,245,249,0.8)",
                            border: "1px solid rgba(226,234,243,0.9)",
                        }}
                        title="Notifications"
                    >
                        <Bell size={16} className="text-[#0a1f3d]/60" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>

                    {/* Profile chip */}
                    <div
                        className="flex items-center gap-3 px-3 py-1.5 rounded-2xl cursor-pointer group transition-all duration-200"
                        style={{
                            background: "rgba(241,245,249,0.8)",
                            border: "1px solid rgba(226,234,243,0.9)",
                        }}
                        onClick={logout}
                        title="Click to sign out"
                    >
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{
                                background: avatarGradient,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        >
                            {initials}
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-[#0a1f3d] text-xs font-bold leading-none">
                                {user?.name || "User"}
                            </span>
                            <span className="text-slate-400 text-[10px] mt-0.5 capitalize font-medium">
                                {user?.role || "Admin"}
                            </span>
                        </div>
                        <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0a1f3d] transition-colors hidden md:block" />
                    </div>
                </div>
            </div>
        </header>
    );
}
