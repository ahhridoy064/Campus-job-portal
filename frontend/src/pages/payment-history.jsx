import React, { useState, useEffect } from "react";
import { getPayments } from "../utils/api";
import {
    CreditCard,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    DollarSign
} from "lucide-react";

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const pays = await getPayments();
                setPayments(pays);
            } catch (err) {
                setError('Failed to load payment history');
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4" />;
            case 'failed': return <XCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success': return 'Completed';
            case 'failed': return 'Failed';
            case 'pending': return 'Pending';
            default: return 'Unknown';
        }
    };

    const PaymentCard = ({ payment }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {payment.description}
                            {payment.sandbox && (
                                <span className="ml-2 text-xs text-yellow-500">(sandbox)</span>
                            )}
                        </h3>
                        <div className="text-xs text-gray-500">
                            Gateway: {payment.gateway}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ৳{payment.amount}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-2">{getStatusText(payment.status)}</span>
                    </span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payment History</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    // Group payments by status
    const groupedPayments = payments.reduce((acc, payment) => {
        if (!acc[payment.status]) {
            acc[payment.status] = [];
        }
        acc[payment.status].push(payment);
        return acc;
    }, {});

    const statusOrder = ['success', 'pending', 'failed'];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                    <p className="mt-2 text-gray-600">Track all your payment transactions and status</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Payments</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{payments.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Successful</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {groupedPayments.success?.length || 0}
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
                                <p className="text-gray-600 text-sm font-medium">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">
                                    {groupedPayments.pending?.length || 0}
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
                                <p className="text-gray-600 text-sm font-medium">Total Amount</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    ৳{payments.filter(p => p.status === 'success').reduce((sum, p) => sum + parseFloat(p.amount), 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payments by Status */}
                {statusOrder.map(status => {
                    const statusPayments = groupedPayments[status];
                    if (!statusPayments || statusPayments.length === 0) return null;

                    return (
                        <div key={status} className="mb-8">
                            <div className="flex items-center mb-4">
                                <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
                                    {getStatusIcon(status)}
                                    <span className="ml-2">{getStatusText(status)} ({statusPayments.length})</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {statusPayments.map((payment) => (
                                    <PaymentCard key={payment.id} payment={payment} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* No Payments Message */}
                {payments.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't made any payments yet.
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
        </div>
    );
};

export default PaymentHistory;

