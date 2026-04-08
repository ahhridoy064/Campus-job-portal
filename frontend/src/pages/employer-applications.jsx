import React, { useState, useEffect } from "react";
import {
    getApplications,
    getApplicationsForJob,
    updateApplicationStatus,
    getApplicationStats,
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
    Plus
} from "lucide-react";

const EmployerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState('all');
    const [jobs, setJobs] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');
    const [showFeedbackTemplates, setShowFeedbackTemplates] = useState(false);

    useEffect(() => {
        fetchApplicationStats();
        fetchJobs();
        fetchApplications();
    }, []);

    const fetchApplicationStats = async () => {
        try {
            const result = await getApplicationStats();
            setStats(result);
        } catch (error) {
            console.error("Failed to fetch application stats:", error);
        }
    };

    const fetchJobs = async () => {
        // This would typically fetch from an API, but for now we'll use mock data
        // In a real app, you'd have an API endpoint to get employer's jobs
        setJobs([
            { id: 'all', title: 'All Jobs' },
            { id: 1, title: 'Software Engineer' },
            { id: 2, title: 'Frontend Developer' },
            { id: 3, title: 'Full Stack Developer' }
        ]);
    };

    const feedbackTemplates = {
        positive: [
            "Excellent technical skills and strong problem-solving abilities demonstrated.",
            "Great communication skills and professional attitude throughout the application process.",
            "Impressive educational background and relevant project experience.",
            "Strong analytical thinking and attention to detail evident in application materials."
        ],
        constructive: [
            "Could benefit from more specific examples of technical achievements.",
            "Consider gaining more experience with modern development frameworks.",
            "Would be helpful to include more details about leadership experience.",
            "Consider improving presentation of technical projects and outcomes."
        ],
        rejection: [
            "While we appreciate your interest, we have selected candidates with more directly relevant experience.",
            "Thank you for applying. We encourage you to apply for future positions as you gain more experience.",
            "We received many strong applications and unfortunately cannot proceed with yours at this time.",
            "Your qualifications are impressive, but we have chosen candidates whose experience more closely matches our current needs."
        ]
    };

    const insertTemplate = (template) => {
        const currentFeedback = feedback.trim();
        const newFeedback = currentFeedback
            ? currentFeedback + '\n\n' + template
            : template;
        setFeedback(newFeedback);
    };

    const clearFeedback = () => {
        setFeedback('');
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            let result = [];

            if (selectedJob === 'all') {
                // Get all applications for employer's jobs
                result = await getApplications();
                console.log("Fetched applications:", result);
            } else {
                // Get applications for specific job
                result = await getApplicationsForJob(selectedJob);
                console.log("Fetched applications for job:", selectedJob, result);
            }

            // Ensure we have an array and handle different response formats
            let applicationsArray = [];
            if (Array.isArray(result)) {
                applicationsArray = result;
            } else if (result && result.data && Array.isArray(result.data)) {
                applicationsArray = result.data;
            } else if (result && typeof result === 'object') {
                // If it's an object, try to extract applications from it
                applicationsArray = [];
            }

            setApplications(applicationsArray);
            setLoading(false);

            console.log("Raw API result:", result);
            console.log("Final applications array:", applicationsArray);
            console.log("Applications array length:", applicationsArray.length);
            console.log("First application (if any):", applicationsArray[0]);
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            setApplications([]);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        // Encourage feedback for all status updates, but only require it for final decisions
        if (!feedback.trim() && (newStatus === 'hired' || newStatus === 'rejected')) {
            const shouldContinue = window.confirm(
                'You haven\'t provided feedback for this candidate. Feedback helps candidates improve and creates a better hiring process.\n\nWould you like to add feedback before proceeding?'
            );
            if (!shouldContinue) return;
        }

        // Warn if no feedback provided for any status change
        if (!feedback.trim() && newStatus !== 'applied') {
            console.warn('Status updated without feedback - consider adding feedback for better candidate experience');
        }

        try {
            setActionLoading(true);
            await updateApplicationStatus(applicationId, {
                status: newStatus,
                feedback: feedback
            });

            // Update local state
            setApplications(applications.map(app =>
                app.id === applicationId
                    ? { ...app, status: newStatus, employer_feedback: feedback }
                    : app
            ));

            setShowModal(false);
            setFeedback('');
            setSelectedApplication(null);
            setShowFeedbackTemplates(false);
            fetchApplicationStats(); // Refresh stats

            // Show success message
            alert(`Application status updated to "${newStatus}" successfully!${feedback.trim() ? ' Feedback has been saved.' : ''}`);
        } catch (error) {
            console.error("Failed to update application status:", error);

            // Provide more specific error messages based on the error
            let errorMessage = 'Failed to update application status. Please try again.';

            if (error.message.includes('Unauthorized')) {
                errorMessage = 'You are not authorized to update this application status. Please make sure you are logged in as an employer.';
            } else if (error.message.includes('Application not found')) {
                errorMessage = 'The application could not be found. It may have been deleted or already processed.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error occurred. Please try again in a few moments.';
            }

            alert(errorMessage + '\n\nTechnical details: ' + error.message);
        } finally {
            setActionLoading(false);
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
                            {application.first_name} {application.last_name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {application.email}
                        </div>
                        {application.phone && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {application.phone}
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
                            setFeedback(application.employer_feedback || '');
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
                                        {application.first_name} {application.last_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{application.email}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {application.phone || 'Not provided'}
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

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Feedback <span className="text-red-500">*</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({feedback.length}/1000 characters)
                                        </span>
                                    </label>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowFeedbackTemplates(!showFeedbackTemplates)}
                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <MessageSquare className="w-3 h-3 mr-1" />
                                            Templates
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearFeedback}
                                            className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Write detailed feedback about this candidate's application, skills, experience, and fit for the position. Be specific about strengths, areas for improvement, and your overall assessment..."
                                        className={`w-full p-4 border rounded-lg resize-none transition-all duration-200 ${
                                            feedback.length > 900
                                                ? 'border-orange-300 focus:ring-orange-500 focus:border-orange-500 bg-orange-50'
                                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                        rows={6}
                                        maxLength={1000}
                                    />
                                    {feedback.length > 900 && (
                                        <div className="absolute bottom-2 right-2 text-xs text-orange-600 font-medium">
                                            {1000 - feedback.length} left
                                        </div>
                                    )}
                                </div>

                                {/* Feedback Templates */}
                                {showFeedbackTemplates && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                                        <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Templates:</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Positive feedback:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {feedbackTemplates.positive.map((template, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => insertTemplate(template)}
                                                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                                                        >
                                                            + {template.substring(0, 30)}...
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Constructive feedback:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {feedbackTemplates.constructive.map((template, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => insertTemplate(template)}
                                                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                                                        >
                                                            + {template.substring(0, 30)}...
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Rejection feedback:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {feedbackTemplates.rejection.map((template, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => insertTemplate(template)}
                                                            className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                                                        >
                                                            + {template.substring(0, 30)}...
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-2 mt-2">
                                    <span className="text-xs text-gray-500">💡</span>
                                    <p className="text-xs text-gray-500">
                                        Tip: Provide constructive feedback that will help the candidate improve and maintain a positive relationship
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Applications</h1>
                    <p className="mt-2 text-gray-600">Review and manage job applications from candidates</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_applications || 0}</p>
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
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending_applications || 0}</p>
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
                                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.shortlisted || 0}</p>
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
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.hired || 0}</p>
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
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected || 0}</p>
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
                                {jobs.map(job => (
                                    <option key={job.id} value={job.id}>{job.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {applications.length} applications
                            </span>
                        </div>
                    </div>
                </div>

                {/* Applications Grid */}
                {applications.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {applications.map((application) => (
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
                        <a
                            href="/post-job"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mr-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Post a Job
                        </a>
                        <button
                            onClick={async () => {
                                try {
                                    const testResult = await getApplications();
                                    console.log("Raw API Test Result:", testResult);
                                    console.log("Type of result:", typeof testResult);
                                    console.log("Is array:", Array.isArray(testResult));
                                    console.log("Result keys:", testResult ? Object.keys(testResult) : 'null');

                                    if (testResult && testResult.data) {
                                        console.log("Result.data:", testResult.data);
                                        console.log("Result.data is array:", Array.isArray(testResult.data));
                                        console.log("Result.data length:", testResult.data.length);
                                    }

                                    setDebugInfo(`API Test: Raw result type: ${typeof testResult}, Array: ${Array.isArray(testResult)}, Length: ${Array.isArray(testResult) ? testResult.length : (testResult?.data?.length || 0)}`);
                                } catch (error) {
                                    setDebugInfo(`API Error: ${error.message}`);
                                    console.error("API Test Error:", error);
                                }
                            }}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            Test API
                        </button>
                        <div className="text-sm text-gray-400">
                            <p><strong>Possible reasons for no applications:</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>You haven't posted any jobs yet</li>
                                <li>No students have applied to your jobs</li>
                                <li>Check browser console for API errors</li>
                                <li>Ensure you're logged in as an employer</li>
                            </ul>
                            <p className="mt-4"><strong>Debug Info:</strong></p>
                            <p>Selected Job: {selectedJob}</p>
                            <p>Applications Array Length: {applications.length}</p>
                            <p>Stats: {JSON.stringify(stats)}</p>
                            {debugInfo && <p className="mt-2 text-blue-600 font-medium">{debugInfo}</p>}

                            {/* Show applications from stats if main array is empty but stats show applications */}
                            {applications.length === 0 && stats.total_applications > 0 && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-800 font-medium">⚠️ Data Mismatch Detected!</p>
                                    <p className="text-yellow-700 text-sm">
                                        Stats show {stats.total_applications} applications, but applications array is empty.
                                        This suggests an API response format issue.
                                    </p>
                                </div>
                            )}

                            {/* Show if no jobs are posted */}
                            {stats.total_applications === 0 && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-800 font-medium">📋 No Jobs Posted</p>
                                    <p className="text-blue-700 text-sm">
                                        You haven't posted any jobs yet. Students need to see your job postings before they can apply.
                                    </p>
                                </div>
                            )}
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
                    setFeedback('');
                    setSelectedApplication(null);
                    setShowFeedbackTemplates(false);
                }}
            />
        </div>
    );
};

export default EmployerApplications;