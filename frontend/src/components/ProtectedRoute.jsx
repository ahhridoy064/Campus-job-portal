import React from 'react';
import { useAuth } from '../utils/authContext';

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/login' }) => {
    const { isLoggedIn, user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!isLoggedIn) {
        // Redirect to login
        window.location.href = redirectTo;
        return null;
    }

    if (requiredRole && role !== requiredRole) {
        // Redirect to unauthorized page or home
        window.location.href = '/';
        return null;
    }

    return children;
};

export default ProtectedRoute;
