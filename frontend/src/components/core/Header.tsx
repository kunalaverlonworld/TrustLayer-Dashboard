// src/components/core/Header.tsx
import React from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useSearch } from "../../context/SearchContext";

function getInitials(name?: string): string {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
}

function getAvatarColor(name?: string): string {
    if (!name) return "bg-gray-500";

    const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-orange-500",
    ];

    const index =
        name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        colors.length;

    return colors[index];
}

export default function Header() {
    const { user, logout } = useAuth();
    const { searchQuery, setSearchQuery } = useSearch();

    const initials = getInitials(user?.name);
    const avatarColor = getAvatarColor(user?.name);

    return (
        <header className="w-full bg-white/0 backdrop-blur-md z-40 shadow-sm">
            <div className="max-w-[1440px] mx-auto h-16 px-6 md:px-10 flex items-center justify-between ml-20">

                {/* Logo */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-semibold shadow-md">
                        TL
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        TrustLayer
                    </span>
                </div>

                {/* Search */}
                <div className="hidden md:flex items-center bg-white/50 backdrop-blur-lg border border-white/40 rounded-full px-4 py-2 w-96 shadow-sm">
                    <Search size={16} className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
                    />
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-6">

                    {/* Notifications */}
                    <button className="relative text-gray-600 hover:text-black transition">
                        <Bell size={18} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full"></span>
                    </button>

                    {/* User Info + Logout */}
                    <div className="flex items-center space-x-3">

                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-sm font-medium text-gray-800">
                                {user?.name}
                            </span>
                            <span className="text-xs text-gray-500 capitalize flex items-center gap-1 justify-end">
                                {user?.role}
                                <span className="bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold tracking-wider">
                                    {localStorage.getItem("plan") || "basic"}
                                </span>
                            </span>
                        </div>

                        <div
                            className={`w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-semibold shadow-md`}
                            title={user?.role}
                        >
                            {initials}
                        </div>

                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-red-500 transition"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
