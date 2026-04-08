import React, { useState, useEffect } from "react";
import { getApplications, downloadResume } from "../utils/api";
import {
    FileText,
    Building,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Eye,
    Download,
    ExternalLink
} from "lucide-react";

const StudentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const result = await getApplications();
            setApplications(result);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            setLoading(false);
        }
    };

    const handleDownloadResume = async (applicationId) => {
        try {
            const response = await downloadResume(applicationId);

            // Get filename from response headers or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `resume_${applicationId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="([^"]*)"/) || contentDisposition.match(/filename=([^;]*)/);
                if (filenameMatch) {
                    filename = filenameMatch[1].trim();
                }
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Failed to download resume:", error);
            alert('Failed to download resume. Please try again.');
        }
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

    const getStatusText = (status) => {
        switch (status) {
            case 'applied': return 'Under Review';
            case 'shortlisted': return 'Shortlisted';
            case 'hired': return 'Hired';
            case 'rejected': return 'Not Selected';
            default: return 'Unknown';
        }
    };

    const ApplicationCard = ({ application }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {application.job?.title || 'Job Title Not Available'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Building className="w-4 h-4 mr-1" />
                            {application.job?.company_name || 'Company Name Not Available'}
                        </div>
                        {application.job?.location && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.job.location}
                            </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Applied: {new Date(application.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-2">{getStatusText(application.status)}</span>
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
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                    </button>
                </div>
                {application.job && (
                    <button
                        onClick={() => window.open(`/jobdetails/${application.job.id}`, '_blank')}
                        className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Job
                    </button>
                )}
            </div>

            {/* Employer Feedback */}
            {application.employer_feedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Employer Feedback:</span>
                    </div>
                    <p className="text-sm text-gray-600">{application.employer_feedback}</p>
                </div>
            )}
        </div>
    );

    const ApplicationModal = ({ application, isOpen, onClose }) => {
        if (!isOpen || !application) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                        {application.job?.title || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                        {application.job?.company_name || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Application Status</label>
                                <div className={`inline-flex items-center px-3 py-2 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                                    {getStatusIcon(application.status)}
                                    <span className="ml-2">{getStatusText(application.status)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {new Date(application.created_at).toLocaleString()}
                                </p>
                            </div>

                            {application.reviewed_at && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed Date</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                        {new Date(application.reviewed_at).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Details</label>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-900">
                                        <strong>Name:</strong> {application.first_name} {application.last_name}
                                    </p>
                                    <p className="text-gray-900 mt-1">
                                        <strong>Email:</strong> {application.email}
                                    </p>
                                    {application.phone && (
                                        <p className="text-gray-900 mt-1">
                                            <strong>Phone:</strong> {application.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {application.cover_letter || 'No cover letter provided'}
                                    </p>
                                </div>
                            </div>

                            {/* Employer Feedback */}
                            {application.employer_feedback && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer Feedback</label>
                                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                        <p className="text-gray-900">{application.employer_feedback}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                        >
                            Close
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
                    <p className="mt-4 text-gray-600">Loading your applications...</p>
                </div>
            </div>
        );
    }

    // Group applications by status
    const groupedApplications = applications.reduce((acc, app) => {
        if (!acc[app.status]) {
            acc[app.status] = [];
        }
        acc[app.status].push(app);
        return acc;
    }, {});

    const statusOrder = ['hired', 'shortlisted', 'applied', 'rejected'];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                    <p className="mt-2 text-gray-600">Track the status of your job applications</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{applications.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Under Review</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">
                                    {groupedApplications.applied?.length || 0}
                                </p>
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
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    {groupedApplications.shortlisted?.length || 0}
                                </p>
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
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {groupedApplications.hired?.length || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications by Status */}
                {statusOrder.map(status => {
                    const statusApps = groupedApplications[status];
                    if (!statusApps || statusApps.length === 0) return null;

                    return (
                        <div key={status} className="mb-8">
                            <div className="flex items-center mb-4">
                                <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
                                    {getStatusIcon(status)}
                                    <span className="ml-2">{getStatusText(status)} ({statusApps.length})</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {statusApps.map((application) => (
                                    <ApplicationCard key={application.id} application={application} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* No Applications Message */}
                {applications.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't applied to any jobs yet. Start exploring job opportunities!
                        </p>
                        <a
                            href="/joblistings"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Browse Jobs
                        </a>
                    </div>
                )}
            </div>

            {/* Application Details Modal */}
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

export default StudentApplications;