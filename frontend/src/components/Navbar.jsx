import React from "react";
import { Menu, Briefcase, Home, Info, Mail, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../utils/authContext";

const Navbar = ({ toggleSidebar }) => {
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <nav className="bg-slate-900/80 backdrop-blur-xl shadow-2xl border-b border-blue-500/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Toggle Sidebar Button */}
                    <button
                        onClick={toggleSidebar}
                        className="h-10 w-10 bg-blue-900/40 hover:bg-blue-800/60 rounded-lg border border-blue-400/30 hover:border-blue-300/50 flex items-center justify-center backdrop-blur-sm transition-all duration-200 group"
                        aria-label="Toggle sidebar"
                    >
                        <Menu
                            size={20}
                            className="text-blue-200 group-hover:text-blue-100 transition-colors duration-200"
                        />
                    </button>

                    {/* Logo */}
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600/40 to-indigo-600/40 rounded-lg border border-blue-400/30 flex items-center justify-center backdrop-blur-sm">
                        <Briefcase
                            size={20}
                            className="text-blue-200"
                        />
                    </div>

                    {/* Brand Name */}
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-300 bg-clip-text text-transparent">
                        Campus Job Portal
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="flex gap-2 items-center">
                    <a
                        href="/"
                        className="text-slate-200 hover:text-blue-200 hover:bg-blue-900/30 font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-400/30 flex items-center gap-2 group"
                    >
                        <Home
                            size={16}
                            className="group-hover:scale-110 transition-transform duration-200"
                        />
                        Home
                    </a>

                    <a
                        href="/about"
                        className="text-slate-200 hover:text-blue-200 hover:bg-blue-900/30 font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-400/30 flex items-center gap-2 group"
                    >
                        <Info
                            size={16}
                            className="group-hover:scale-110 transition-transform duration-200"
                        />
                        About
                    </a>

                    <a
                        href="/contact"
                        className="text-slate-200 hover:text-blue-200 hover:bg-blue-900/30 font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-400/30 flex items-center gap-2 group"
                    >
                        <Mail
                            size={16}
                            className="group-hover:scale-110 transition-transform duration-200"
                        />
                        Contact
                    </a>

                    {/* User Menu - Show when logged in */}
                    {isLoggedIn && user && (
                        <>
                            {/* Elegant separator */}
                            <div className="w-px h-6 bg-gradient-to-b from-transparent via-blue-400/50 to-transparent mx-3"></div>

                            {/* User Info */}
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                                    <User size={16} className="text-blue-300" />
                                </div>
                                <span className="font-medium">{user.name || user.email}</span>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="bg-gradient-to-r from-red-700/80 to-red-600/80 hover:from-red-600/90 hover:to-red-500/90 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 border border-red-400/30 hover:border-red-300/50 backdrop-blur-sm shadow-lg hover:shadow-red-500/25 flex items-center gap-2 group"
                            >
                                <LogOut
                                    size={16}
                                    className="group-hover:scale-110 transition-transform duration-200"
                                />
                                Logout
                            </button>
                        </>
                    )}

                    {/* Login/Register Button - Show when not logged in */}
                    {!isLoggedIn && (
                        <>
                            {/* Elegant separator */}
                            <div className="w-px h-6 bg-gradient-to-b from-transparent via-blue-400/50 to-transparent mx-3"></div>

                            {/* Login/Register Button */}
                            <a
                                href="/login"
                                className="bg-gradient-to-r from-blue-700/80 to-indigo-700/80 hover:from-blue-600/90 hover:to-indigo-600/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 border border-blue-400/30 hover:border-blue-300/50 backdrop-blur-sm shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 group"
                            >
                                <LogIn
                                    size={16}
                                    className="group-hover:scale-110 transition-transform duration-200"
                                />
                                Login/Register
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* Subtle bottom accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
        </nav>
    );
};

export default Navbar;