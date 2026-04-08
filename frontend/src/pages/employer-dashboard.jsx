import React, { useState, useEffect } from "react";
import ProfileCard from "../components/ProfileCard";
import ProfileImage from "../components/ProfileImage";
import { getUser, apiRequest, getEmployerProfile, updateEmployerProfile } from "../utils/api";
import {
    Briefcase,
    Building2,
    Edit3,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2,
    Eye,
    Trash2,
    Users,
    TrendingUp,
    MapPin,
    DollarSign,
    Clock,
    Plus
} from "lucide-react";

const EmployerDashboard = () => {
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Company profile states
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [companyLogo, setCompanyLogo] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userData = await getUser();
                setUser(userData);

                const [jobsData, appsData] = await Promise.all([
                    apiRequest('/jobs'),
                    apiRequest('/applications')
                ]);

                const employerJobs = jobsData.filter(job => job.employer_id === userData.id);
                setJobs(employerJobs);
                setApplications(appsData);

                // Fetch employer profile data with error handling and detailed logging
                try {
                    const profileData = await getEmployerProfile();
                    if (!profileData || typeof profileData !== 'object') {
                        throw new Error('Invalid profile data received');
                    }
                    setCompanyName(profileData.company_name || "");
                    setIndustry(profileData.industry || "");
                    setWebsite(profileData.website || "");
                    setDescription(profileData.description || "");
                    setCompanyLogo(profileData.company_logo || "");
                } catch (profileErr) {
                    console.error('Error fetching employer profile:', profileErr);
                    setProfileError('Failed to load profile data');
                }
            } catch (err) {
                setError('Failed to load data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
                setProfileLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDashboardStats = () => {
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(job => {
            const jobApps = applications.filter(app => app.job_id === job.id);
            return jobApps.length > 0;
        }).length;
        const totalApplications = applications.filter(app =>
            jobs.some(job => job.id === app.job_id)
        ).length;
        const avgApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

        return { totalJobs, activeJobs, totalApplications, avgApplicationsPerJob };
    };

    const getApplicationCount = (jobId) => {
        return applications.filter(app => app.job_id === jobId).length;
    };

    const getJobTypeColor = (type) => {
        switch (type) {
            case 'Permanent': return 'bg-green-100 text-green-800';
            case 'Part-time': return 'bg-blue-100 text-blue-800';
            case 'Internship': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setSubmitError("");
        try {
            await updateEmployerProfile({
                company_name: companyName,
                industry,
                website,
                description,
                company_logo: companyLogo,
            });
            setSuccessMessage("Company profile updated successfully.");
        } catch (err) {
            setSubmitError("Failed to update company profile. " + err.message);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove the job from local state
            setJobs(jobs.filter(job => job.id !== jobId));
            alert('Job deleted successfully!');
        } catch (error) {
            console.error("Failed to delete job:", error);
            alert('Failed to delete job. Please try again.');
        }
    };

    const JobCard = ({ job }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            ${job.salary?.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getJobTypeColor(job.type)}`}>
                                {job.type}
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            {getApplicationCount(job.id)} Applications
                        </div>
                    </div>

                    {job.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {job.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => window.open(`/jobdetails/${job.id}`, '_blank')}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                    </button>
                    <button
                        onClick={() => window.location.href = `/manage-jobs?edit=${job.id}`}
                        className="flex items-center px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                    >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit Job
                    </button>
                    <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    ID: {job.id}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const stats = getDashboardStats();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Profile */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
                        <p className="mt-2 text-gray-600">Manage your jobs and company profile</p>
                    </div>
                    {user && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <ProfileImage user={user} />
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalJobs}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Active Jobs</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeJobs}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalApplications}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Avg Applications/Job</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.avgApplicationsPerJob}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <ProfileCard name={user?.name} role={user?.role} skills={["HR", "Recruitment"]} />
                        </div>
                    </div>

                    {/* Right Column - Jobs and Profile */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Success/Error Messages */}
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 text-green-800">
                                    <CheckCircle size={20} />
                                    <span className="font-medium">{successMessage}</span>
                                </div>
                            </div>
                        )}

                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 text-red-800">
                                    <AlertCircle size={20} />
                                    <span className="font-medium">{submitError}</span>
                                </div>
                            </div>
                        )}

                        {/* Manage Jobs Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Manage Jobs</h2>
                                </div>
                                <a
                                    href="/post-job"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Post New Job
                                </a>
                            </div>

                            {jobs.length > 0 ? (
                                <div className="space-y-4">
                                    {jobs.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        Start by posting your first job to attract top talent.
                                    </p>
                                    <a
                                        href="/post-job"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Post Your First Job
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Company Profile Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Company Profile</h2>
                            </div>

                            {profileLoading ? (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Loading profile...</span>
                                </div>
                            ) : profileError ? (
                                <div className="flex items-center gap-3 text-red-600">
                                    <AlertCircle size={20} />
                                    <span>{profileError}</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Company Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                placeholder="Enter company name"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Industry
                                            </label>
                                            <input
                                                type="text"
                                                name="industry"
                                                placeholder="Enter industry"
                                                value={industry}
                                                onChange={(e) => setIndustry(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            placeholder="https://example.com"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Logo URL
                                        </label>
                                        <input
                                            type="url"
                                            name="company_logo"
                                            placeholder="https://example.com/logo.png"
                                            value={companyLogo}
                                            onChange={(e) => setCompanyLogo(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            placeholder="Tell us about your company..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                                        >
                                            <Save size={18} />
                                            Update Profile
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerDashboard;
