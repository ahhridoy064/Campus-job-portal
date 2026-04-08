import React, { useState, useEffect } from "react";
import {
    apiRequest,
    getApplicationsForJob,
    updateApplicationStatus,
    downloadResume
} from "../utils/api";
import {
    FileText,
    User,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Download,
    MessageSquare,
    TrendingUp,
    Users,
    Eye,
    Filter,
    Briefcase,
    MapPin,
    DollarSign
} from "lucide-react";

const ApplicationsForJob = () => {
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState('all');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appsData, jobsData] = await Promise.all([
                apiRequest('/applications'),
                apiRequest('/jobs')
            ]);
            setApplications(appsData);
            setJobs(jobsData);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getApplicationStats = () => {
        const totalApplications = applications.length;
        const pendingApplications = applications.filter(app => app.status === 'applied').length;
        const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
        const hired = applications.filter(app => app.status === 'hired').length;
        const rejected = applications.filter(app => app.status === 'rejected').length;

        return { totalApplications, pendingApplications, shortlisted, hired, rejected };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-100 text-blue-800';
            case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
            case 'hired': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'applied': return <Clock className="w-4 h-4" />;
            case 'shortlisted': return <Star className="w-4 h-4" />;
            case 'hired': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            setActionLoading(true);
            await updateApplicationStatus(applicationId, {
                status: newStatus
            });

            // Update local state
            setApplications(applications.map(app =>
                app.id === applicationId
                    ? { ...app, status: newStatus }
                    : app
            ));

            setShowModal(false);
            setSelectedApplication(null);

            alert(`Application status updated to "${newStatus}" successfully!`);
        } catch (error) {
            console.error("Failed to update application status:", error);
            alert('Failed to update application status. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadResume = async (applicationId) => {
        try {
            console.log('Starting resume download for application:', applicationId);
            console.log('Auth token:', localStorage.getItem('token'));

            const response = await downloadResume(applicationId);

            console.log('Download response received:', response);

            // Get filename from response headers or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `resume_${applicationId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="([^"]*)"/) || contentDisposition.match(/filename=([^;]*)/);
                if (filenameMatch) {
                    filename = filenameMatch[1].trim();
                }
            }

            console.log('Downloading file:', filename);

            // Create blob and download
            const blob = await response.blob();
            console.log('Blob created:', blob.size, 'bytes');

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('Resume download completed successfully');

        } catch (error) {
            console.error("Failed to download resume:", error);
            alert(`Failed to download resume: ${error.message}`);
        }
    };

    const ApplicationCard = ({ application }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {application.user?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {application.user?.email || 'No email'}
                        </div>
                        {application.user?.phone && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {application.user.phone}
                            </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Applied: {new Date(application.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                    </span>
                </div>
            </div>

            {application.cover_letter && (
                <div className="mt-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                        {application.cover_letter}
                    </p>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {application.resume_path && (
                        <button
                            onClick={() => handleDownloadResume(application.id)}
                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Resume
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setSelectedApplication(application);
                            setShowModal(true);
                        }}
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Review
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    Job: {application.job?.title || 'N/A'}
                </div>
            </div>
        </div>
    );

    const ApplicationModal = ({ application, isOpen, onClose }) => {
        if (!isOpen || !application) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Review Application</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                        {application.user?.name || 'Unknown User'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{application.user?.email || 'No email'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {application.user?.phone || 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {application.job?.title || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {new Date(application.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {application.cover_letter || 'No cover letter provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                            disabled={actionLoading}
                            className="px-4 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                            Shortlist
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(application.id, 'hired')}
                            disabled={actionLoading}
                            className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                            Hire
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            disabled={actionLoading}
                            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Applications</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const stats = getApplicationStats();
    const filteredApplications = selectedJob === 'all'
        ? applications
        : applications.filter(app => app.job_id === parseInt(selectedJob));

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Applications for Jobs</h1>
                    <p className="mt-2 text-gray-600">Review and manage applications from candidates</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalApplications}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingApplications}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Shortlisted</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.shortlisted}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Star className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Hired</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.hired}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <select
                                value={selectedJob}
                                onChange={(e) => setSelectedJob(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Jobs</option>
                                {jobs.map(job => (
                                    <option key={job.id} value={job.id}>{job.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {filteredApplications.length} applications
                            </span>
                        </div>
                    </div>
                </div>

                {/* Applications Grid */}
                {filteredApplications.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredApplications.map((application) => (
                            <ApplicationCard key={application.id} application={application} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-500 mb-4">
                            {selectedJob === 'all'
                                ? 'No applications have been submitted yet.'
                                : 'No applications found for the selected job.'
                            }
                        </p>
                        <div className="text-sm text-gray-400">
                            <p><strong>Possible reasons:</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>You haven't posted any jobs yet</li>
                                <li>No students have applied to your jobs</li>
                                <li>Check if you're logged in as an employer</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Application Review Modal */}
            <ApplicationModal
                application={selectedApplication}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedApplication(null);
                }}
            />
        </div>
    );
};

export default ApplicationsForJob;

