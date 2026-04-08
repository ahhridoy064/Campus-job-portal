import React, { useState, useEffect } from "react";
import { LayoutDashboard, User, Briefcase, FileText, CreditCard, Building, Plus, Settings, Users, LogOut } from "lucide-react";
import { useAuth } from "../utils/authContext";

const Sidebar = ({ isOpen }) => {
    const role = localStorage.getItem("role");
    const [compactMode, setCompactMode] = useState(false);
    const [animateItems, setAnimateItems] = useState(false);
    const { logout } = useAuth();

    const toggleCompactMode = () => {
        setCompactMode(!compactMode);
    };

    // Trigger animations when sidebar opens
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure smooth animation
            const timer = setTimeout(() => {
                setAnimateItems(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setAnimateItems(false);
        }
    }, [isOpen]);

    const renderLink = (href, icon, label, index = 0) => (
        <a
            href={href}
            className={`text-slate-200 hover:text-blue-300 hover:bg-blue-600/20 font-medium py-2 px-3 rounded-lg transition-all duration-200 block border border-transparent hover:border-blue-400/30 flex items-center gap-3 transform ${
                animateItems
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-4 opacity-0'
            }`}
            style={{
                transitionDelay: animateItems ? `${index * 50}ms` : '0ms',
                transition: 'all 0.3s ease-out'
            }}
        >
            <span className={`transition-transform duration-200 ${animateItems ? 'scale-100' : 'scale-75'}`}>
                {icon}
            </span>
            {!compactMode && (
                <span className={`transition-all duration-300 ${animateItems ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}>
                    {label}
                </span>
            )}
        </a>
    );

    return (
        <>
            {/* Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden"
                    style={{
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-800/85 backdrop-blur-md shadow-2xl border border-blue-500/20 h-full ${
                    compactMode ? "w-20" : "w-64"
                } flex flex-col gap-4 fixed top-16 left-0 z-40 transition-all duration-500 ease-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } lg:${isOpen ? "flex" : "hidden"}`}
                style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
            <div className="flex flex-col items-start w-full px-4 pt-4 pb-2">
                {/* Toggle switch for compact mode */}
                <button
                    onClick={toggleCompactMode}
                    className="mb-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold"
                    aria-label="Toggle sidebar compact mode"
                >
                    {compactMode ? "Expand" : "Compact"}
                </button>
            </div>

            <nav className="flex flex-col gap-1 px-4 pb-6">
                {role === "student" && (
                    <div className="mb-3">
                        <h3 className="text-blue-300 text-xs uppercase tracking-wider font-semibold mb-2 px-2 opacity-70">
                            Student Portal
                        </h3>
                        {renderLink("/student-dashboard", <LayoutDashboard size={18} />, "Student Dashboard")}
                        {renderLink("/student-profile", <User size={18} />, "My Profile")}
                        {renderLink("/joblistings", <Briefcase size={18} />, "Browse Jobs")}
                        {renderLink("/my-applications", <FileText size={18} />, "My Applications")}
                        {renderLink("/payment-history", <CreditCard size={18} />, "Payment History")}
                    </div>
                )}

                {role === "employer" && (
                    <>
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent my-3"></div>
                        <div className="mb-3">
                            <h3 className="text-blue-300 text-xs uppercase tracking-wider font-semibold mb-2 px-2 opacity-70">
                                Employer Portal
                            </h3>
                            {renderLink("/employer-dashboard", <LayoutDashboard size={18} />, "Employer Dashboard")}
                            {renderLink("/employer-profile", <Building size={18} />, "Company Profile")}
                            {renderLink("/post-job", <Plus size={18} />, "Post a Job")}
                            {renderLink("/manage-jobs", <Settings size={18} />, "Manage Jobs")}
                            {renderLink("/applications-for-job", <Users size={18} />, "Applications for Job")}
                        </div>
                    </>
                )}

                <div className="h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent my-3"></div>

                {/* Admin Section - Only show if user is admin */}
                {role === "admin" && (
                    <div>
                        <h3 className="text-blue-300 text-xs uppercase tracking-wider font-semibold mb-2 px-2 opacity-70">
                            Administration
                        </h3>
                        {renderLink("/admin-dashboard", <LayoutDashboard size={18} />, "Admin Dashboard")}
                    </div>
                )}

                {/* Logout Button */}
                <div className="mt-auto mb-4 px-4">
                    <button
                        onClick={logout}
                        className={`w-full text-slate-200 hover:text-red-300 hover:bg-red-600/20 font-medium py-2 px-3 rounded-lg transition-all duration-200 border border-transparent hover:border-red-400/30 flex items-center gap-3 transform ${
                            animateItems
                                ? 'translate-x-0 opacity-100'
                                : '-translate-x-4 opacity-0'
                        }`}
                        style={{
                            transitionDelay: animateItems ? '800ms' : '0ms',
                            transition: 'all 0.3s ease-out'
                        }}
                    >
                        <span className={`transition-transform duration-200 ${animateItems ? 'scale-100' : 'scale-75'}`}>
                            <LogOut size={18} />
                        </span>
                        {!compactMode && (
                            <span className={`transition-all duration-300 ${animateItems ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}>
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </nav>

                {/* Subtle bottom accent */}
                <div className="mb-4 mx-4">
                    <div className="h-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/50 to-blue-500/30 rounded-full"></div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
