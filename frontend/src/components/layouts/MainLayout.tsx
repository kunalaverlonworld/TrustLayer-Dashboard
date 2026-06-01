// src/components/core/MainLayout.tsx
import React from "react";
import Sidebar from "../core/Sidebar";
import Header from "../core/Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-white text-gray-900 relative">
            <Sidebar />
            <Header />
            <main className="ml-20 mt-5 mb-6 px-4 md:px-8 lg:px-16">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
