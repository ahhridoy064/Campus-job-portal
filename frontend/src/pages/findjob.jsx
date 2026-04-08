import React, { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";
import { TrendingUp, Building, Target, Loader2, AlertCircle, Search, Filter } from "lucide-react";
import JobCard from "../components/JobCard";

const FindJob = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobsData = await apiRequest('/jobs');
                setJobs(jobsData);
                setFilteredJobs(jobsData);
            } catch (err) {
                setError('Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        let filtered = jobs;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(lowerSearch) ||
                job.company.toLowerCase().includes(lowerSearch) ||
                job.location.toLowerCase().includes(lowerSearch)
            );
        }
        if (filterType !== "All") {
            filtered = filtered.filter(job => job.type === filterType);
        }
        setFilteredJobs(filtered);
    }, [searchTerm, filterType, jobs]);

    if (loading) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 text-white">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-lg">Loading jobs...</span>
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

    // Calculate stats dynamically
    const liveJobsCount = jobs.length;
    const uniqueEmployers = new Set(jobs.map(job => job.company)).size;
    const newJobsCount = jobs.filter(job => {
        const createdAt = new Date(job.created_at);
        const now = new Date();
        const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        return diffDays <= 7; // jobs posted in last 7 days
    }).length;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center px-2 py-8">
                <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <section className="flex-1">
                        {/* Hero & Search Card */}
                        <div className="relative mb-8">
                            <div className="relative z-10 p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex flex-col items-center">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Find the right job</h1>
                                {/* Stats Row */}
                                <div className="flex flex-wrap justify-center gap-6 mb-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 mb-1 border-2 border-blue-300/50">
                                            <TrendingUp className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="text-white text-lg font-bold">{liveJobsCount}</span>
                                        <span className="text-blue-200 text-xs">LIVE JOBS</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 mb-1 border-2 border-blue-300/50">
                                            <Building className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="text-white text-lg font-bold">{uniqueEmployers}</span>
                                        <span className="text-blue-200 text-xs">VERIFIED EMPLOYERS</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 mb-1 border-2 border-blue-300/50">
                                            <Target className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="text-white text-lg font-bold">{newJobsCount}</span>
                                        <span className="text-blue-200 text-xs">NEW JOBS THIS WEEK</span>
                                    </div>
                                </div>
                                {/* Search and Filters */}
                                <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search by title, company, or location"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full rounded-xl py-3 px-4 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    </div>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* Job Listings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map(job => (
                                    <JobCard
                                        key={job.id}
                                        id={job.id}
                                        title={job.title}
                                        company={job.company}
                                        location={job.location}
                                        salary={job.salary}
                                        type={job.type}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-white text-lg col-span-full">No jobs found matching your criteria.</p>
                            )}
                        </div>
                    </section>
                    {/* Sidebar Quick Links */}
                    <aside className="w-full lg:w-72 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 h-fit">
                        <h3 className="text-lg font-bold text-white mb-4">QUICK LINKS</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline"><Building className="w-4 h-4" /> Employer List ({uniqueEmployers})</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline"><Target className="w-4 h-4" /> New Jobs ({newJobsCount})</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline">Deadline Tomorrow</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline">Internship Opportunity</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline">Contractual Jobs</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline">Part time Jobs</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline">Overseas Jobs</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline">Work From Home</a></li>
                            <li><a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white hover:underline">Fresher Jobs</a></li>
                        </ul>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default FindJob;
