import React from "react";

const Button = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl";

    const variants = {
        primary: "bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500/90 hover:to-indigo-500/90 text-white border border-blue-400/30 hover:border-blue-300/50 backdrop-blur-sm",
        secondary: "bg-gradient-to-r from-slate-700/80 to-slate-600/80 hover:from-slate-600/90 hover:to-slate-500/90 text-slate-200 border border-slate-500/30 hover:border-slate-400/50 backdrop-blur-sm",
        success: "bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-500/90 hover:to-emerald-500/90 text-white border border-green-400/30 hover:border-green-300/50 backdrop-blur-sm",
        danger: "bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500/90 hover:to-rose-500/90 text-white border border-red-400/30 hover:border-red-300/50 backdrop-blur-sm"
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${className}`}
            {...props}
        >
            <span className="relative z-10">{children}</span>
        </button>
    );
};

export default Button;
