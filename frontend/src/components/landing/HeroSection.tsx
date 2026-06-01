import React from "react";
import { motion } from "framer-motion";

const HeroStripe = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-white flex flex-col">

            {/* Gradient Background Glow */}
            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-purple-200 via-blue-200 to-indigo-200 blur-3xl opacity-40 rounded-full" />

            {/* Header */}
            <header className="relative z-10 w-full px-10 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-2xl font-semibold tracking-tight">
                    TrustLayer
                </div>

                <nav className="flex items-center gap-8 text-sm font-medium">
                    <a href="#features" className="text-gray-600 hover:text-black transition">
                        Product
                    </a>
                    <a href="#developers" className="text-gray-600 hover:text-black transition">
                        Developers
                    </a>
                    <a href="#pricing" className="text-gray-600 hover:text-black transition">
                        Pricing
                    </a>
                    <a href="/login" className="text-gray-600 hover:text-black transition">
                        Login
                    </a>
                    <a
                        href="/signup"
                        className="bg-black text-white px-6 py-3 rounded-full hover:opacity-90 transition shadow-lg"
                    >
                        Start Free
                    </a>
                </nav>
            </header>

            {/* Hero */}
            <section className="relative z-10 flex-1 flex items-center justify-center px-6 text-center">
                <div className="max-w-4xl">

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-6xl md:text-7xl font-semibold tracking-tight leading-tight"
                    >
                        Smarter Hiring
                        <br />
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                            Powered by Trust
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
                    >
                        TrustLayer transforms hiring signals into actionable,
                        explainable TrustScores — helping HR teams reduce risk and hire confidently.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-10 flex justify-center gap-6"
                    >
                        <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:opacity-90 transition shadow-xl">
                            Start Free Trial
                        </button>

                        <button className="border border-gray-300 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition">
                            View Demo
                        </button>
                    </motion.div>

                </div>
            </section>
        </div>
    );
};

export default HeroStripe;
