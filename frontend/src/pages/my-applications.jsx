import React, { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";
import { FileText, Loader2, AlertCircle } from "lucide-react";

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const apps = await apiRequest('/applications');
                setApplications(apps);
            } catch (err) {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 text-white">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-lg">Loading applications...</span>
                </div>
            </div>
        </main>
    );

    if (error) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg border border-red-300/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 text-red-200">
                    <AlertCircle size={24} />
                    <span className="text-lg">{error}</span>
                </div>
            </div>
        </main>
    );

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center px-4 py-12">
                <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText size={24} className="text-blue-400" />
                        <h1 className="text-2xl font-bold text-white">My Applications</h1>
                    </div>
                    <ul className="list-disc list-inside text-blue-100">
                        {applications.map(app => (
                            <li key={app.id}>
                                {app.job.title} - <span className="text-blue-300">{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
};

export default MyApplications;

