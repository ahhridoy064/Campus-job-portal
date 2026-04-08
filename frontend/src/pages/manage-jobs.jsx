import React, { useState, useEffect } from "react";
import {
    getUser,
    apiRequest,
    updateJob,
    deleteJobByUser
} from "../utils/api";
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Edit,
    Trash2,
    Eye,
    Plus,
    Users,
    CheckCircle,
    AlertCircle,
    TrendingUp
} from "lucide-react";

const ManageJobs = () => {
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userData = await getUser();
            setUser(userData);

            const jobsData = await apiRequest('/jobs');
            const employerJobs = jobsData.filter(job => job.employer_id === userData.id);
            setJobs(employerJobs);

            const appsData = await apiRequest('/applications');
            setApplications(appsData);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getApplicationCount = (jobId) => {
        return applications.filter(app => app.job_id === jobId).length;
    };

    const getJobStats = () => {
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(job => {
            const appCount = getApplicationCount(job.id);
            return appCount > 0;
        }).length;
        const totalApplications = applications.filter(app =>
            jobs.some(job => job.id === app.job_id)
        ).length;

        return { totalJobs, activeJobs, totalApplications };
    };

    const handleEditJob = (job) => {
        setSelectedJob(job);
        setShowEditModal(true);
    };

    const handleDeleteJob = (job) => {
        setJobToDelete(job);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!jobToDelete) return;

        try {
            setActionLoading(true);
            await deleteJobByUser(jobToDelete.id);
            setJobs(jobs.filter(job => job.id !== jobToDelete.id));
            setShowDeleteModal(false);
            setJobToDelete(null);
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveJob = async (updatedJobData) => {
        if (!selectedJob) return;

        try {
            setActionLoading(true);
            console.log('Updating job with data:', updatedJobData);
            const updatedJob = await updateJob(selectedJob.id, updatedJobData);
            console.log('Job updated successfully:', updatedJob);
            setJobs(jobs.map(job =>
                job.id === selectedJob.id ? updatedJob : job
            ));
            setShowEditModal(false);
            setSelectedJob(null);
            alert('Job updated successfully!');
        } catch (error) {
            console.error('Error updating job:', error);
            const errorMessage = error.message || 'Failed to update job. Please try again.';
            alert(`Failed to update job: ${errorMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    const getJobTypeColor = (type) => {
        switch (type) {
            case 'Permanent': return 'bg-green-100 text-green-800';
            case 'Part-time': return 'bg-blue-100 text-blue-800';
            case 'Internship': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
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
                        onClick={() => handleEditJob(job)}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeleteJob(job)}
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

    const JobEditModal = ({ job, isOpen, onClose, onSave }) => {
        const [formData, setFormData] = useState({
            title: '',
            company: '',
            location: '',
            salary: '',
            type: 'Permanent',
            description: ''
        });

        useEffect(() => {
            if (job) {
                setFormData({
                    title: job.title || '',
                    company: job.company || '',
                    location: job.location || '',
                    salary: job.salary || '',
                    type: job.type || 'Permanent',
                    description: job.description || ''
                });
            }
        }, [job]);

        const handleSubmit = (e) => {
            e.preventDefault();
            // Ensure salary is sent as a number
            const dataToSave = {
                ...formData,
                salary: parseFloat(formData.salary) || 0
            };
            onSave(dataToSave);
        };

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        if (!isOpen || !job) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Job</h2>
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
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Salary <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="Permanent">Permanent</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Job description..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                {actionLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle, loading }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delete Job</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete the job <strong>"{jobTitle}"</strong>?
                            This action cannot be undone.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            All associated applications will also be removed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete Job'}
                            </button>
                        </div>
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
                    <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Jobs</h3>
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

    const stats = getJobStats();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
                    <p className="mt-2 text-gray-600">Create, edit, and manage your job postings</p>
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
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    {stats.totalJobs > 0 ? Math.round(stats.totalApplications / stats.totalJobs) : 0}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
                            </span>
                        </div>
                        <a
                            href="/post-job"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Post New Job
                        </a>
                    </div>
                </div>

                {/* Jobs Grid */}
                {jobs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                        <p className="text-gray-500 mb-6">
                            Start by posting your first job to attract candidates.
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

            {/* Edit Modal */}
            <JobEditModal
                job={selectedJob}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedJob(null);
                }}
                onSave={handleSaveJob}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setJobToDelete(null);
                }}
                onConfirm={confirmDelete}
                jobTitle={jobToDelete?.title}
                loading={actionLoading}
            />
        </div>
    );
};

export default ManageJobs;

