// src/components/core/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { Home, BarChart3, LogOut, ClipboardCheck, LayoutDashboard } from "lucide-react";

export default function Sidebar() {
  const menu = [
    { icon: <LayoutDashboard size={20} />, path: "/dashboard", label: "Dashboard" },
    // { icon: <Home size={20} />, path: "/dashboard/home", label: "Home" },
    // { icon: <BarChart3 size={20} />, path: "/dashboard/analytics", label: "Analytics" },
    { icon: <ClipboardCheck size={20} />, path: "/dashboard/hr-feedback", label: "HR Feedback" },
    { icon: <ClipboardCheck size={20} />, path: "/dashboard/employees", label: "Employees" },
  ];

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <aside
      className="
        fixed top-1/2 -translate-y-1/2 left-6
        w-16 py-6 flex flex-col justify-between
        rounded-2xl bg-[#ffffffef] backdrop-blur-md
        border border-[#BFCFBB]/60
        shadow-[0_6px_28px_rgba(18,46,52,0.18)]
        z-50
      "
    >
      {/* MENU */}
      <div className="flex flex-col items-center space-y-6">
        {menu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              `group relative flex items-center justify-center p-3 rounded-2xl transition-all
               hover:scale-110 hover:bg-[#F9FAF9]
               ${isActive ? "bg-[#F9FAF9] border border-[#BFCFBB]" : ""}`
            }
          >
            {item.icon}
            <span className="absolute left-full ml-3 whitespace-nowrap bg-[#0D0D0D] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>

      {/* LOGOUT */}
      <button
        title="Logout"
        onClick={logout}
        className="group relative mx-auto p-3 rounded-2xl transition-all hover:scale-110 hover:bg-[#F9FAF9]"
      >
        <LogOut size={20} />
        <span className="absolute left-full ml-3 whitespace-nowrap bg-[#0D0D0D] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
          Logout
        </span>
      </button>
    </aside>
  );
}
