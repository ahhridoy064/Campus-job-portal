import React from "react";
import { Zap } from "lucide-react";

const StudentSkills = () => (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 py-12">
            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                    <Zap size={24} className="text-blue-400" />
                    <h1 className="text-2xl font-bold text-white">Student Skills</h1>
                </div>
                <ul className="list-disc list-inside text-blue-100">
                    <li>Student 1: React, Design</li>
                    <li>Student 2: Marketing, Python</li>
                </ul>
            </div>
        </div>
    </main>
);

export default StudentSkills;

