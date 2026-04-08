import React, { useState, useEffect } from "react";
import { getJobs } from "../utils/api";
import { Search, Briefcase, Users, Clock, UserCheck } from "lucide-react";
import Button from "../components/Button";

const Home = () => {
    const [stats, setStats] = useState({
        liveJobs: 0,
        vacancies: 0,
        companies: 0,
        newJobs: 0
    });
    const [jobs, setJobs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("Organization Type");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const jobsData = await getJobs();
                setJobs(jobsData);
                const companies = new Set(jobsData.map(job => job.company)).size;
                const newJobs = jobsData.filter(job => {
                    const jobDate = new Date(job.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return jobDate > weekAgo;
                }).length;
                setStats({
                    liveJobs: jobsData.length,
                    vacancies: jobsData.length, // Assuming vacancies = jobs for now
                    companies,
                    newJobs
                });
            } catch (err) {
                console.error('Failed to load stats', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <main className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center px-2 py-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>
            <div className="w-full max-w-4xl mx-auto z-10">
                {/* Hero & Search Card */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-indigo-800/30 rounded-2xl blur-sm" style={{ zIndex: 0 }}></div>
                    <div className="relative z-10 p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex flex-col items-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2 tracking-tight">Campus Job Portal</h1>
                        <p className="text-lg md:text-xl text-blue-100/90 mb-6 text-center">Connecting students with the best campus jobs and internships. Start your career journey with opportunities tailored for you!</p>
                        
                        {/* Stats Row */}
                        <div className="flex flex-wrap justify-center gap-6 mb-6">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400/20 backdrop-blur-sm mb-1 border-2 border-blue-400/30">
                                    <Briefcase className="w-6 h-6 text-blue-300" />
                                </div>
                                <span className="text-blue-100 text-base font-bold">{stats.liveJobs.toLocaleString()}</span>
                                <span className="text-blue-300/80 text-xs">LIVE JOBS</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400/20 backdrop-blur-sm mb-1 border-2 border-blue-400/30">
                                    <UserCheck className="w-6 h-6 text-blue-300" />
                                </div>
                                <span className="text-blue-100 text-base font-bold">{stats.vacancies.toLocaleString()}+</span>
                                <span className="text-blue-300/80 text-xs">VACANCIES</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400/20 backdrop-blur-sm mb-1 border-2 border-blue-400/30">
                                    <Users className="w-6 h-6 text-blue-300" />
                                </div>
                                <span className="text-blue-100 text-base font-bold">{stats.companies}</span>
                                <span className="text-blue-300/80 text-xs">COMPANIES</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400/20 backdrop-blur-sm mb-1 border-2 border-blue-400/30">
                                    <Clock className="w-6 h-6 text-blue-300" />
                                </div>
                                <span className="text-blue-100 text-base font-bold">{stats.newJobs}</span>
                                <span className="text-blue-300/80 text-xs">NEW JOBS</span>
                            </div>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="w-full flex flex-col md:flex-row items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mt-2">
                            <div className="flex items-center flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded px-2">
                                <Search className="w-5 h-5 text-blue-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search by keyword"
                                    className="flex-1 px-2 py-2 rounded border-none focus:outline-none text-blue-100 bg-transparent placeholder-blue-300/60"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-4 py-2 rounded bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 focus:outline-none focus:border-blue-400/50"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option className="bg-slate-800">Organization Type</option>
                                <option className="bg-slate-800">Company</option>
                                <option className="bg-slate-800">NGO</option>
                                <option className="bg-slate-800">University</option>
                            </select>
                            <Button
                                variant="primary"
                                className="px-8"
                                onClick={() => {
                                    // For now, just log the search
                                    console.log('Search:', searchQuery, filterType);
                                    // In a full implementation, filter jobs and display
                                }}
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 w-full">
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-500/20 rounded-xl shadow-2xl p-6 flex flex-col items-center hover:border-blue-400/30 hover:scale-[1.02] transition-all duration-300 group">
                        <Briefcase className="w-10 h-10 text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-200" />
                        <h3 className="font-bold text-lg mb-2 text-blue-300 group-hover:text-blue-200 transition-colors duration-200">Student Focused</h3>
                        <p className="text-slate-300 text-center">Opportunities designed for students and fresh graduates.</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-500/20 rounded-xl shadow-2xl p-6 flex flex-col items-center hover:border-blue-400/30 hover:scale-[1.02] transition-all duration-300 group">
                        <UserCheck className="w-10 h-10 text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-200" />
                        <h3 className="font-bold text-lg mb-2 text-blue-300 group-hover:text-blue-200 transition-colors duration-200">Verified Employers</h3>
                        <p className="text-slate-300 text-center">All job postings are from trusted and verified campus partners.</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-500/20 rounded-xl shadow-2xl p-6 flex flex-col items-center hover:border-blue-400/30 hover:scale-[1.02] transition-all duration-300 group">
                        <Users className="w-10 h-10 text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-200" />
                        <h3 className="font-bold text-lg mb-2 text-blue-300 group-hover:text-blue-200 transition-colors duration-200">Easy Application</h3>
                        <p className="text-slate-300 text-center">Apply to jobs and internships with a simple, user-friendly process.</p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Home;
