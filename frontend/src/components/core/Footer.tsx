// src/components/core/Footer.tsx
import React from "react";

export default function Footer() {
    return (
        <footer className="w-full border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold tracking-tight">
                            TrustLayer
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Elegant, explainable TrustScore infrastructure for modern hiring teams.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-medium mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-black transition cursor-pointer">Features</li>
                            <li className="hover:text-black transition cursor-pointer">Pricing</li>
                            <li className="hover:text-black transition cursor-pointer">Demo</li>
                            <li className="hover:text-black transition cursor-pointer">Security</li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-medium mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-black transition cursor-pointer">About</li>
                            <li className="hover:text-black transition cursor-pointer">Careers</li>
                            <li className="hover:text-black transition cursor-pointer">Blog</li>
                            <li className="hover:text-black transition cursor-pointer">Contact</li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-medium mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-black transition cursor-pointer">Privacy Policy</li>
                            <li className="hover:text-black transition cursor-pointer">Terms of Service</li>
                            <li className="hover:text-black transition cursor-pointer">Data Protection</li>
                            <li className="hover:text-black transition cursor-pointer">Compliance</li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Strip */}
                <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 space-y-4 md:space-y-0">

                    <div>
                        © {new Date().getFullYear()} Averlonworld. All rights reserved.
                    </div>

                    <div className="flex items-center space-x-6">
                        <span className="hover:text-black transition cursor-pointer">
                            Support
                        </span>
                        <span className="hover:text-black transition cursor-pointer">
                            Status
                        </span>
                        <span className="hover:text-black transition cursor-pointer">
                            Trust Intelligence Platform
                        </span>
                    </div>

                </div>
            </div>
        </footer>
    );
}
