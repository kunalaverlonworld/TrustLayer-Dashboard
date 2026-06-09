// src/components/core/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { Home, BarChart3, LogOut, ClipboardCheck, LayoutDashboard } from "lucide-react";

export default function Sidebar() {
  const plan = localStorage.getItem("plan")?.toLowerCase() ?? "basic";

  const menu = [
    { icon: <LayoutDashboard size={20} />, path: "/dashboard", label: "Dashboard" },
  ];

  // HR Feedback is available to Starter and above
  if (plan !== "basic" && plan !== "free") {
    menu.push({ icon: <ClipboardCheck size={20} />, path: "/dashboard/hr-feedback", label: "HR Feedback" });
  }

  // Employees is available to Pro, Business, Enterprise
  if (plan !== "basic" && plan !== "free" && plan !== "starter") {
    menu.push({ icon: <ClipboardCheck size={20} />, path: "/dashboard/employees", label: "Employees" });
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("plan");
    localStorage.removeItem("licenseId");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <aside
      className="
        fixed top-1/2 -translate-y-1/2 left-6
        w-16 py-6 flex flex-col justify-between
        rounded-3xl bg-[#ffffffef] backdrop-blur-md
        border border-[#e2eaf3]
        shadow-[0_10px_30px_rgba(10,31,61,0.06)]
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
              `group relative flex items-center justify-center p-3 rounded-2xl transition-all duration-250
               hover:scale-110 hover:bg-[#e0f7fa]/30 hover:text-[#0097b2]
               ${isActive ? "bg-[#e0f7fa]/50 text-[#0097b2] border border-[#00b8d4]/30" : "text-[#0a1f3d]/70"}`
            }
          >
            {item.icon}
            <span className="absolute left-full ml-3 whitespace-nowrap bg-[#0a1f3d] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>

      {/* LOGOUT */}
      <button
        title="Logout"
        onClick={logout}
        className="group relative mx-auto p-3 rounded-2xl transition-all duration-250 hover:scale-110 hover:bg-rose-50 hover:text-rose-600 text-[#0a1f3d]/70"
      >
        <LogOut size={20} />
        <span className="absolute left-full ml-3 whitespace-nowrap bg-[#0a1f3d] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
          Logout
        </span>
      </button>
    </aside>
  );
}
