// src/components/core/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardCheck,
    Users,
    LogOut,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";

export default function Sidebar() {
    const plan = localStorage.getItem("plan")?.toLowerCase() ?? "basic";
    const navigate = useNavigate();

    const menu: { icon: React.ReactNode; path: string; label: string; badge?: string }[] = [
        {
            icon: <LayoutDashboard size={18} />,
            path: "/dashboard",
            label: "Dashboard",
        },
    ];

    if (plan !== "basic" && plan !== "free") {
        menu.push({
            icon: <ClipboardCheck size={18} />,
            path: "/dashboard/hr-feedback",
            label: "HR Feedback",
            badge: "New",
        });
    }

    if (plan !== "basic" && plan !== "free" && plan !== "starter") {
        menu.push({
            icon: <Users size={18} />,
            path: "/dashboard/employees",
            label: "Employees",
        });
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("plan");
        localStorage.removeItem("licenseId");
        localStorage.removeItem("user");
        navigate("/");
    };

    const planLabel = (localStorage.getItem("plan") || "Basic").toUpperCase();
    const planColor =
        planLabel === "ENTERPRISE"
            ? "from-amber-500/10 to-orange-600/10 border border-amber-500/20 text-amber-800"
            : planLabel === "PRO" || planLabel === "BUSINESS"
            ? "from-[#e0f7fa]/60 to-[#b2ebf2]/60 border border-[#00b8d4]/20 text-[#0097b2]"
            : "from-slate-100 to-slate-200 border border-slate-200 text-slate-600";

    return (
        <aside
            className="fixed top-0 left-0 h-full w-64 flex flex-col z-50 bg-white"
            style={{
                borderRight: "1px solid #e2eaf3",
                boxShadow: "0 0 24px rgba(10,31,61,0.04)",
            }}
        >
            {/* Logo */}
            <div className="px-6 pt-7 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #00b8d4, #1565c0)",
                            boxShadow: "0 4px 14px rgba(0,184,212,0.25)",
                        }}
                    >
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="text-[#0a1f3d] font-extrabold text-lg tracking-tight leading-none">
                            Trust<span className="text-[#00b8d4]">Layer</span>
                        </div>
                        <div className="text-slate-400 text-[10px] font-medium tracking-widest mt-0.5">
                            AI ANALYTICS
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan badge */}
            <div className="px-4 pt-4 pb-2">
                <div
                    className={`flex items-center gap-2 bg-gradient-to-r ${planColor} rounded-xl px-3 py-2.5`}
                    style={{ backdropFilter: "blur(5px)" }}
                >
                    <div className="w-1.5 h-1.5 bg-[#00b8d4] rounded-full animate-pulse shadow-[0_0_8px_#00b8d4]" />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        {planLabel} PLAN
                    </span>
                </div>
            </div>

            {/* Navigation section label */}
            <div className="px-6 pt-4 pb-2">
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em]">
                    Navigation
                </span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {menu.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                            `group flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                                isActive
                                    ? "bg-[#e0f7fa]/60 text-[#0097b2] shadow-xs"
                                    : "text-slate-600 hover:text-[#0097b2] hover:bg-[#e0f7fa]/30"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`${
                                            isActive
                                                ? "text-[#0097b2]"
                                                : "text-slate-400 group-hover:text-[#0097b2]"
                                        } transition-colors`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.badge && (
                                        <span className="bg-[#00b8d4] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && (
                                        <ChevronRight
                                            size={14}
                                            className="text-[#0097b2]"
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom: Logout */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 text-sm font-semibold group"
                >
                    <LogOut
                        size={18}
                        className="group-hover:text-rose-600 transition-colors"
                    />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
