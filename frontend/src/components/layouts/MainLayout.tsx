// src/components/layouts/MainLayout.tsx
import React, { useState } from "react";
import Sidebar from "../core/Sidebar";
import Header from "../core/Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div
            className="min-h-screen text-slate-800 relative overflow-hidden flex w-full"
            style={{ background: "linear-gradient(180deg, #F0F7FF 0%, #ffffff 50%, #F0F7FF 100%)" }}
        >
            {/* Background decorative elements */}
            <div
                className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle,rgba(0,184,212,0.08) 0%,transparent 70%)",
                    filter: "blur(70px)",
                }}
            />
            <div
                className="absolute bottom-[-80px] left-[80px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle,rgba(124,58,237,0.05) 0%,transparent 70%)",
                    filter: "blur(70px)",
                }}
            />
            <div
                className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle,rgba(0,184,212,0.04) 0%,transparent 70%)",
                    filter: "blur(90px)",
                }}
            />

            {/* Backdrop overlay for mobile sidebar */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-h-screen lg:ml-64 ml-0 relative z-10 w-full min-w-0">
                <Header onToggleSidebar={() => setIsMobileSidebarOpen(o => !o)} />
                <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
