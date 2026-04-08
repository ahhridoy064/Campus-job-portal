import React from "react";
import { X } from "lucide-react";

const Modal = ({ open, onClose, children, size = 'default' }) => {
    if (!open) return null;

    const sizeClasses = {
        default: 'max-w-lg',
        large: 'max-w-4xl',
        xl: 'max-w-7xl',
        full: 'max-w-[95vw] max-h-[95vh]'
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
            <div
                className={`relative bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-800/85 backdrop-blur-md border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-900/50 animate-in zoom-in-95 duration-500 ${sizeClasses[size] || sizeClasses.default}`}
                style={size === 'xl' ? {maxWidth: '1400px', minHeight: '600px'} : {}}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-blue-200 transition-all duration-300 hover:bg-blue-600/20 rounded-full w-10 h-10 flex items-center justify-center z-20 hover:scale-110 border border-transparent hover:border-blue-400/30 backdrop-blur-sm"
                    aria-label="Close modal"
                >
                    <X size={20} className="transition-transform duration-300 hover:rotate-90" />
                </button>

                {/* Modal Content */}
                <div className="relative p-6">
                    {children}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
                <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent"></div>
            </div>
        </div>
    );
};

export default Modal;