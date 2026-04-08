import React from "react";
import { Info } from "lucide-react";

const About = () => (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center px-2 py-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-8 relative z-10">
            <div className="text-center mb-6">
                <Info className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4 drop-shadow">About Campus Job Portal</h1>
            </div>
            <p className="text-blue-100/90 mb-4 leading-relaxed">Campus Job Portal is dedicated to connecting students with the best campus jobs and internships. We help students start their career journey with opportunities tailored for them, and help employers find the right talent for their needs.</p>
            <p className="text-blue-100/90 leading-relaxed">Our platform is secure, easy to use, and trusted by thousands of students and employers across the country.</p>
        </div>
    </main>
);

export default About;

