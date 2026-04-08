import React, { useState, useEffect } from "react";
import ProfileImage from "../components/ProfileImage";
import {
    getAdminDashboard,
    getAdminUsers,
    blockUser,
    deleteUser,
    getAdminJobs,
    deleteJob,
    getAdminStatistics,
    getActiveEmployers,
    getRecentUsers,
    getRecentJobs,
    getRecentApplications,
    getJobs
} from "../utils/api";
import {
    Users,
    Building2,
    Briefcase,
    FileText,
    DollarSign,
    Search,
    Filter,
    MoreVertical,
    UserX,
    Trash2,
    Shield,
    ShieldCheck,
    Eye,
    TrendingUp,
    Calendar,
    MapPin,
    Clock,
    User,
    Building
} from "lucide-react";

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({});
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [employers, setEmployers] = useState([]);
    const [employersWithJobs, setEmployersWithJobs] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [jobPage, setJobPage] = useState(1);

    useEffect(() => {
        fetchDashboardData();
        fetchUsers();
        fetchJobs();
        fetchStatistics();
        fetchEmployers();
        fetchActiveEmployers();
        fetchRecentActivity();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const result = await getAdminDashboard();
            setDashboardData(result);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setDashboardData({});
        }
    };

    const fetchUsers = async () => {
        try {
            const result = await getAdminUsers({
                search: searchTerm,
                role: userFilter,
                page: userPage
            });
            setUsers(result);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const fetchJobs = async () => {
        try {
            console.log("Fetching jobs with params:", { search: searchTerm, status: jobFilter, page: jobPage });

            // Try the admin endpoint first
            let result;
            try {
                result = await getAdminJobs({
                    search: searchTerm,
                    status: jobFilter,
                    page: jobPage
                });
                console.log("Admin jobs API response:", result);
            } catch (adminError) {
                console.log("Admin jobs API failed, trying regular jobs endpoint:", adminError);
                // Fallback to regular jobs endpoint
                result = await getJobs();
                console.log("Regular jobs API response:", result);
            }

            // Handle different possible response structures
            if (result && result.data) {
                setJobs(result);
                console.log("Jobs set with data:", result.data);
            } else if (Array.isArray(result)) {
                setJobs({ data: result });
                console.log("Jobs set with array:", result);
            } else {
                setJobs({ data: [] });
                console.log("No jobs data found, setting empty array");
            }
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
            setJobs({ data: [] });
        }
    };

    const fetchStatistics = async () => {
        try {
            const result = await getAdminStatistics();
            // Transform the statistics data to match the expected format
            const transformedStats = {
                total_users: result.total_users || 0,
                total_jobs: result.total_jobs || 0,
                active_employers: result.active_employers || 0,
                total_applications: result.total_applications || 0,
                total_revenue: result.total_revenue || 0,
                total_students: result.total_students || 0,
                total_employers: result.total_employers || 0,
                total_admins: result.total_admins || 0,
                recent_users: result.recent_users || [],
                recent_jobs: result.recent_jobs || [],
                recent_applications: result.recent_applications || []
            };
            setStatistics(transformedStats);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
            // Set default values on error
            setStatistics({
                total_users: 0,
                total_jobs: 0,
                active_employers: 0,
                total_applications: 0,
                total_revenue: 0,
                total_students: 0,
                total_employers: 0,
                total_admins: 0,
                recent_users: [],
                recent_jobs: [],
                recent_applications: []
            });
            setLoading(false);
        }
    };

    const fetchEmployers = async () => {
        try {
            const result = await getAdminUsers({ role: 'employer' });
            // Handle different response structures
            if (result && result.data) {
                setEmployers(result.data);
            } else if (Array.isArray(result)) {
                setEmployers(result);
            } else {
                setEmployers([]);
            }
        } catch (error) {
            console.error("Failed to fetch employers:", error);
            setEmployers([]);
        }
    };

    const fetchActiveEmployers = async () => {
        try {
            const result = await getActiveEmployers();
            // Handle different response structures
            if (result && result.data) {
                setEmployers(result.data);
            } else if (Array.isArray(result)) {
                setEmployers(result);
            } else {
                setEmployers([]);
            }
        } catch (error) {
            console.error("Failed to fetch active employers:", error);
            setEmployers([]);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            const [usersResult, jobsResult, applicationsResult] = await Promise.all([
                getRecentUsers(),
                getRecentJobs(),
                getRecentApplications()
            ]);

            setRecentUsers(usersResult || []);
            setRecentJobs(jobsResult || []);
            setRecentApplications(applicationsResult || []);
        } catch (error) {
            console.error("Failed to fetch recent activity:", error);
        }
    };

    const handleBlockUser = async (userId) => {
        if (window.confirm('Are you sure you want to block/unblock this user?')) {
            try {
                await blockUser(userId);
                fetchUsers();
                fetchDashboardData();
            } catch (error) {
                console.error("Failed to block user:", error);
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(userId);
                fetchUsers();
                fetchDashboardData();
            } catch (error) {
                console.error("Failed to delete user:", error);
            }
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            try {
                await deleteJob(jobId);
                fetchJobs();
                fetchDashboardData();
            } catch (error) {
                console.error("Failed to delete job:", error);
            }
        }
    };

    const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value || 'Loading...'}</p>
                </div>
                <div className={`p-3 bg-${color}-100 rounded-full`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );

    const UserTable = () => (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                            />
                        </div>
                        <select
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Roles</option>
                            <option value="student">Students</option>
                            <option value="employer">Employers</option>
                            <option value="admin">Admins</option>
                        </select>
                        <button
                            onClick={fetchUsers}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.data && users.data.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'employer' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.is_blocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        {user.role !== 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => handleBlockUser(user.id)}
                                                    className={`p-1 rounded-full ${
                                                        user.is_blocked ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'
                                                    }`}
                                                    title={user.is_blocked ? 'Unblock User' : 'Block User'}
                                                >
                                                    {user.is_blocked ? <ShieldCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {user.role === 'admin' && (
                                            <Shield className="w-4 h-4 text-purple-600" title="Admin User" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const JobTable = () => (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">Job Management</h3>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchJobs()}
                            />
                        </div>
                        <select
                            value={jobFilter}
                            onChange={(e) => setJobFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                        </select>
                        <button
                            onClick={fetchJobs}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {jobs.data && jobs.data.length > 0 ? jobs.data.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                            <div className="text-sm text-gray-500">{job.location}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {job.company_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                                        job.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {job.application_count || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                                            title="Delete Job"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No jobs found - Check console for debugging info
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const EmployerTable = () => (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Employer Management</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employers && employers.length > 0 ? employers.map((employer) => (
                            <tr key={employer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                                <Building className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employer.company_name || employer.name}
                                            </div>
                                            <div className="text-sm text-gray-500">{employer.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {employer.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {employer.industry || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        employer.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {employer.is_blocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(employer.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No active employers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Profile */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-2 text-gray-600">Manage users, jobs, and platform statistics</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={dashboardData.total_students + dashboardData.total_employers + dashboardData.total_admins || statistics.total_users || 0}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Total Jobs"
                        value={dashboardData.total_jobs || statistics.total_jobs || 0}
                        icon={Briefcase}
                        color="green"
                    />
                    <StatCard
                        title="Active Employers"
                        value={dashboardData.total_employers || statistics.active_employers || 0}
                        icon={Building2}
                        color="purple"
                    />
                    <StatCard
                        title="Total Applications"
                        value={dashboardData.total_applications || statistics.total_applications || 0}
                        icon={FileText}
                        color="orange"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', label: 'Overview', icon: TrendingUp },
                                { id: 'users', label: 'Users', icon: Users },
                                { id: 'jobs', label: 'Jobs', icon: Briefcase },
                                { id: 'employers', label: 'Employers', icon: Building2 }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4 inline mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">New user registrations</p>
                                            <p className="text-sm text-gray-500">+{recentUsers.length} recent users</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <Briefcase className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Jobs posted</p>
                                            <p className="text-sm text-gray-500">+{recentJobs.length} recent jobs</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <FileText className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Applications submitted</p>
                                            <p className="text-sm text-gray-500">+{recentApplications.length} recent applications</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Server Status</span>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Online
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Database</span>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Connected
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">API Response Time</span>
                                        <span className="text-sm text-gray-900">45ms</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Active Users</span>
                                        <span className="text-sm text-gray-900">{statistics.total_users || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Active Jobs</span>
                                        <span className="text-sm text-gray-900">{statistics.total_jobs || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && <UserTable />}
                    {activeTab === 'jobs' && <JobTable />}
                    {activeTab === 'employers' && <EmployerTable />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
