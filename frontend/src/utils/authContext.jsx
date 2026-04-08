import React, { createContext, useContext, useState, useEffect } from 'react';
import { logout as apiLogout } from './api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                const userRole = localStorage.getItem('role');

                if (token && userData && userRole) {
                    try {
                        const parsedUser = JSON.parse(userData);
                        setIsLoggedIn(true);
                        setUser(parsedUser);
                        setRole(userRole);
                    } catch (parseError) {
                        console.error('Error parsing user data:', parseError);
                        // Clear invalid data
                        clearAuthData();
                    }
                }
            } catch (error) {
                console.error('Error accessing localStorage:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const clearAuthData = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
        }
        setIsLoggedIn(false);
        setUser(null);
        setRole(null);
    };

    const handleLogout = async () => {
        try {
            // Call backend logout API
            await apiLogout();

            // Clear local authentication data
            clearAuthData();

            // Redirect to home page
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API call fails, clear local data and redirect
            clearAuthData();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }
    };

    const login = (userData, token, userRole) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('role', userRole);
        }
        setIsLoggedIn(true);
        setUser(userData);
        setRole(userRole);
    };

    const value = {
        isLoggedIn,
        user,
        role,
        loading,
        login,
        logout: handleLogout,
        clearAuthData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;