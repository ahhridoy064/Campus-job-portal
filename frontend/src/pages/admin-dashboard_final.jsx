import React, { useState, useEffect } from "react";
import {
    getAdminDashboard,
    getAdminUsers,
    blockUser,
    deleteUser,
    getAdminJobs,
    deleteJob,
    getAdminStatistics,
    getUsers,
    getEmployersWithJobs
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
        fetchEmployersWithJobs();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const result = await getAdminDashboard();
            setDashboardData(result);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
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
            const result = await getAdminJobs({
                search: searchTerm,
                status: jobFilter,
                page: jobPage
            });
            setJobs(result);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const result = await getAdminStatistics();
            setStatistics(result);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
            setLoading(false);
        }
    };

    const fetchEmployers = async () => {
        try {
            const result = await getUsers({ role: 'employer' });
            setEmployers(result.data || []);
        } catch (error) {
            console.error("Failed to fetch employers:", error);
        }
    };

    const fetchEmployersWithJobs = async () => {
        try {
            const result = await getEmployersWithJobs();
            setEmployersWithJobs(result);
        } catch (error) {
            console.error("Failed to fetch employers with jobs:", error);
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
