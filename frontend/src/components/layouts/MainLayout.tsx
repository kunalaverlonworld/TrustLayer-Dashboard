// src/components/core/MainLayout.tsx
import React from "react";
import Sidebar from "../core/Sidebar";
import Header from "../core/Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen text-gray-900 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#F0F7FF 0%,#fff 50%,#F0F7FF 100%)" }}>
            {/* Decorative blobs */}
            <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none z-0 animate-pulse duration-5000"
                style={{
                    background: "radial-gradient(circle,rgba(0,184,212,0.06) 0%,transparent 70%)",
                    filter: "blur(40px)",
                }}
            />
            <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle,rgba(21,101,192,0.06) 0%,transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            <Sidebar />
            <Header />
            <main className="ml-20 mt-5 mb-6 px-4 md:px-8 lg:px-16 relative z-10">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
