import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";
import { getJobs } from "../utils/api";
import { Briefcase, Loader2, AlertCircle } from "lucide-react";

const JobListings = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobsData = await getJobs();
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

    const handleSearch = (query) => {
        if (!query) {
            setFilteredJobs(jobs);
            return;
        }
        const term = query.toLowerCase();
        const filtered = jobs.filter(
            (job) =>
                job.title.toLowerCase().includes(term) ||
                (job.company_name && job.company_name.toLowerCase().includes(term))
        );
        setFilteredJobs(filtered);
    };

    if (loading) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>
            <div className="flex flex-col items-center gap-4 text-blue-100">
                <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
                <p className="text-lg">Loading jobs...</p>
            </div>
        </main>
    );

    if (error) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>
            <div className="flex flex-col items-center gap-4 text-red-100">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-lg">{error}</p>
            </div>
        </main>
    );

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>
            <div className="max-w-7xl w-full relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 mb-6">
                        <Briefcase className="w-10 h-10 text-blue-300" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                        Browse Jobs
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Discover exciting opportunities tailored for students and fresh graduates
                    </p>
                </div>
                <div className="mb-8">
                    <SearchBar onSearch={handleSearch} data={jobs} />
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-300">{filteredJobs.length}</div>
                        <div className="text-sm text-slate-400">Total Jobs</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-300">{filteredJobs.filter(job => job.salary).length}</div>
                        <div className="text-sm text-slate-400">With Salary</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-300">{new Set(jobs.map(job => job.company)).size}</div>
                        <div className="text-sm text-slate-400">Companies</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600/10 to-red-600/10 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-300">{jobs.filter(job => job.type === 'Full-time').length}</div>
                        <div className="text-sm text-slate-400">Full-time</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredJobs.map((job, index) => (
                        <div
                            className="animate-in hover:scale-105 transition-all duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                            key={job.id}
                        >
                            <JobCard {...job} />
                        </div>
                    ))}
                </div>

                {jobs.length === 0 && !loading && !error && (
                    <div className="text-center py-16">
                        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-12 max-w-md mx-auto">
                            <Briefcase className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-blue-300 mb-2">No Jobs Found</h3>
                            <p className="text-slate-400">Try adjusting your search criteria or check back later for new opportunities.</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default JobListings;

