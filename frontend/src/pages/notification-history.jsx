import React, { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";

const NotificationHistory = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const apps = await apiRequest('/applications');
                setApplications(apps);
            } catch (err) {
                setError('Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return <div className="text-center py-12">Loading notifications...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center px-4 py-12">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-pink-600 to-blue-700 mb-4 drop-shadow">Notification History</h1>
                <ul className="list-disc list-inside text-gray-700">
                    {applications.map(app => {
                        let icon = "⏳";
                        let color = "text-yellow-700";
                        let message = `Your application for ${app.job.title} is under review.`;
                        if (app.status === 'shortlisted') {
                            icon = "⭐";
                            color = "text-blue-700";
                            message = `Your application for ${app.job.title} has been shortlisted.`;
                        } else if (app.status === 'hired') {
                            icon = "🎉";
                            color = "text-green-700";
                            message = `Congratulations! You have been hired for the ${app.job.title} job.`;
                        }
                        return (
                            <li key={app.id}>
                                {icon} <span className={`font-semibold ${color}`}>{message}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </main>
    );
};

export default NotificationHistory;

