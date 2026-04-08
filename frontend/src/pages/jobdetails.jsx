import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { getJob } from "../utils/api";
import { Briefcase, Send, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const jobData = await getJob(id);
                setJob(jobData);
            } catch (err) {
                setError("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApplyClick = () => {
        navigate(`/apply/${id}`);
    };

    if (loading) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl shadow-blue-900/30 relative z-10 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-6 text-white">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300/50 rounded-full animate-spin animation-delay-300"></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Loading Job Details</h3>
                        <p className="text-blue-200">Please wait while we fetch the information...</p>
                    </div>
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            </div>
        </main>
    );

    if (error) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="bg-white/8 backdrop-blur-xl border border-red-400/20 rounded-3xl p-12 shadow-2xl shadow-red-900/20 relative z-10 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-6 text-white">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-400/30">
                        <AlertCircle size={32} className="text-red-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2 text-red-200">Error Loading Job</h3>
                        <p className="text-red-300">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-200 hover:text-red-100 transition-all duration-300 hover:scale-105"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </main>
    );

    if (!job) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl shadow-blue-900/30 relative z-10 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-6 text-white">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
                        <Briefcase size={32} className="text-blue-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Job Not Found</h3>
                        <p className="text-blue-200">The job you're looking for doesn't exist or has been removed.</p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-200 hover:text-blue-100 transition-all duration-300 hover:scale-105"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </main>
    );

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-500/8 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-400/8 rounded-full blur-2xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative z-10 px-4 py-8">
                {/* Back Button */}
                <div className="mb-6 animate-in slide-in-from-left duration-500">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors duration-300"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                </div>

                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 animate-in zoom-in-95 duration-500 delay-200">
                        <div className="flex items-center gap-4 mb-8 animate-in slide-in-from-left duration-500 delay-300">
                            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30 animate-pulse">
                                <Briefcase className="w-8 h-8 text-blue-300" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-in slide-in-from-top duration-500 delay-400">{job.title}</h1>
                                <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-in slide-in-from-left duration-500 delay-500"></div>
                            </div>
                        </div>
                        <p className="mb-8 text-blue-100 text-lg leading-relaxed animate-in slide-in-from-right duration-500 delay-600">{job.context}</p>

                        {/* Job Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-bottom duration-500 delay-700">
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4 hover:bg-slate-800/60 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-slate-400 text-sm">Job Type</span>
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"/>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-slate-200 font-semibold">{job.type}</p>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4 hover:bg-slate-800/60 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-slate-400 text-sm">Salary</span>
                                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-green-300 font-bold text-lg">
                                    {job.salary ? `৳${job.salary.toLocaleString()}` : "Not specified"}
                                </p>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4 hover:bg-slate-800/60 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-slate-400 text-sm">Posted</span>
                                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 11h8m-8-2v2m8-2v2M12 17v-2"/>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-slate-200 font-medium">
                                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                                </p>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4 hover:bg-slate-800/60 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-slate-400 text-sm">Job ID</span>
                                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-slate-200 font-mono">#{job.id}</p>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-6 mb-8 animate-in slide-in-from-bottom duration-500 delay-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-blue-300">Job Description</h2>
                            </div>
                            <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
                                {job.description ? (
                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-slate-200 leading-relaxed whitespace-pre-line">
                                            {job.description}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Description Available</h3>
                                        <p className="text-slate-400">This job doesn't have a detailed description yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-500 delay-1000">
                            <Button
                                onClick={handleApplyClick}
                                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Send size={20} />
                                </div>
                                Apply Now
                            </Button>
                            <Button
                                onClick={() => navigate(-1)}
                                variant="secondary"
                                className="px-8 py-4 text-lg font-semibold"
                            >
                                Back to Jobs
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default JobDetails;
