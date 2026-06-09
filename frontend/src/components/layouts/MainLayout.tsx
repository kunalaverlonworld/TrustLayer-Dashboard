// src/components/layouts/MainLayout.tsx
import React from "react";
import Sidebar from "../core/Sidebar";
import Header from "../core/Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="min-h-screen text-gray-900 relative overflow-hidden flex"
            style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#f8faff 40%,#eef6ff 100%)" }}
        >
            {/* Background decorative elements */}
            <div
                className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle,rgba(0,184,212,0.08) 0%,transparent 70%)",
                    filter: "blur(60px)",
                }}
            />
            <div
                className="absolute bottom-[-80px] left-[80px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle,rgba(21,101,192,0.07) 0%,transparent 70%)",
                    filter: "blur(60px)",
                }}
            />
            <div
                className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle,rgba(0,184,212,0.04) 0%,transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen ml-64 relative z-10">
                <Header />
                <main className="flex-1 px-8 py-6 lg:px-10">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
