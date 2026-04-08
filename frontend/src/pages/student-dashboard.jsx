import React, { useState, useEffect } from "react";
import ProfileCard from "../components/ProfileCard";
import ProfileImage from "../components/ProfileImage";
import { getUser, apiRequest, postPayment } from "../utils/api";
import { FileText, CreditCard, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // payment form state
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        description: '',
        gateway: 'manual',
        sandbox: true,
    });
    const [formError, setFormError] = useState('');

    // Combine payments and application fees into transactions
    const transactions = [
        ...payments.map(pay => ({
            id: `payment-${pay.id}`,
            type: 'deposit',
            description: pay.description,
            amount: parseFloat(pay.amount),
            status: pay.status,
            date: new Date(pay.created_at || pay.timestamp),
        })),
        ...applications.map(app => ({
            id: `application-${app.id}`,
            type: 'fee',
            description: `Application fee for ${app.job?.title || 'Job'}`,
            amount: -500,
            status: 'completed',
            date: new Date(app.applied_at || app.created_at),
        })),
    ].sort((a, b) => b.date - a.date);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUser();
                setUser(userData);
                const apps = await apiRequest('/applications');
                setApplications(apps);
                const pays = await apiRequest('/payments');
                setPayments(pays);
            } catch (err) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const submitPayment = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            const result = await postPayment(paymentForm);
            setPayments(prev => [result, ...prev]);
            setPaymentForm({ amount:'', description:'', gateway:'manual', sandbox:true });
            // Refresh user data to update balance
            const userData = await getUser();
            setUser(userData);
        } catch (err) {
            console.error('Payment error', err);
            setFormError(err.message || 'Payment failed');
        }
    };

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
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600">{error}</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                    </div>
                    {user && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <ProfileImage user={user} />
                        </div>
                    )}
                </div>
                    <p className="mt-2 text-gray-600">Welcome back, {user?.name}! Here's your overview.</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Account Balance</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">৳{user?.balance || 0}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CreditCard className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
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
                                <p className="text-gray-600 text-sm font-medium">Pending Payments</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">
                                    {payments.filter(p => p.status === 'pending').length}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <CreditCard className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Successful Payments</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {payments.filter(p => p.status === 'success').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    ৳{applications.length * 500}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <CreditCard className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <ProfileCard name={user?.name} role={user?.role} skills={["React", "Design", "Marketing"]} resumeUrl="#" />
                    </div>

                    {/* Applications and Payments */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Form */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard size={24} className="text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Make a Payment</h2>
                            </div>
                            <form onSubmit={submitPayment} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Amount"
                                        value={paymentForm.amount}
                                        onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                    <select
                                        value={paymentForm.gateway}
                                        onChange={e => setPaymentForm({...paymentForm, gateway: e.target.value})}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="stripe">Stripe</option>
                                    </select>
                                </div>
                                <textarea
                                    placeholder="Description"
                                    value={paymentForm.description}
                                    onChange={e => setPaymentForm({...paymentForm, description: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={paymentForm.sandbox}
                                        onChange={e => setPaymentForm({...paymentForm, sandbox: e.target.checked})}
                                        id="sandbox"
                                    />
                                    <label htmlFor="sandbox" className="text-sm">Sandbox mode</label>
                                </div>
                                {formError && <p className="text-red-500">{formError}</p>}
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                    Submit Payment
                                </button>
                            </form>
                        </div>

                        {/* Applications Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText size={24} className="text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
                            </div>
                            {applications.length > 0 ? (
                                <div className="space-y-3">
                                    {applications.map(app => (
                                        <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{app.job?.title || 'Job Title'}</p>
                                                <p className="text-sm text-gray-600">{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                                                app.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                                                app.status === 'hired' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No applications yet. Start applying to jobs!</p>
                            )}
                        </div>

                        {/* Transactions Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard size={24} className="text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
                            </div>
                            {transactions.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{tx.description}</p>
                                                <p className="text-sm text-gray-600">
                                                    {tx.type === 'deposit' ? `+৳${tx.amount}` : `৳${tx.amount}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    tx.status === 'success' || tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {tx.status === 'completed' ? 'Completed' : tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        // Remove transaction from local state
                                                        setPayments(prev => prev.filter(p => `payment-${p.id}` !== tx.id));
                                                        setApplications(prev => prev.filter(a => `application-${a.id}` !== tx.id));
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
                                                    title="Remove transaction"
                                                >
                                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No transactions yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default StudentDashboard;

