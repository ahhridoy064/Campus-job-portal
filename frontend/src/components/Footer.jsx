import React from "react";

const Footer = () => (
<footer className="bg-gradient-to-r from-slate-900/95 via-blue-900/90 to-indigo-800/85 backdrop-blur-md border-t border-blue-500/20 py-6 relative z-20">
        {/* Subtle top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-300 text-sm font-medium text-center md:text-left">
                &copy; {new Date().getFullYear()} 
                <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent font-semibold mx-1">
                    Campus Job Portal
                </span>
                - All rights reserved.
            </div>
            
            <div className="flex gap-6 text-sm">
                <a href="/about" className="text-slate-200 hover:text-blue-300 transition-colors duration-200">
                    About
                </a>
                <a href="/contact" className="text-slate-200 hover:text-blue-300 transition-colors duration-200">
                    Contact
                </a>
                <a href="/terms" className="text-slate-200 hover:text-blue-300 transition-colors duration-200">
                    Terms
                </a>
            </div>
        </div>
        
        {/* Bottom gradient accent */}
        <div className="h-px bg-gradient-to-r from-blue-500/20 via-indigo-500/40 to-blue-500/20"></div>
    </footer>
);

export default Footer;