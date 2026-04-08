import React, { useState, useEffect } from "react";
import { getApplications } from "../utils/api";

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const apps = await getApplications();
                setApplications(apps);
            } catch (err) {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return <div className="text-center py-12">Loading applications...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center px-4 py-12">
            <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-pink-600 mb-4">Applications</h1>
                <ul className="list-disc list-inside text-gray-700">
                    {applications.map(app => (
                        <li key={app.id}>
                            {app.user.name} applied for {app.job.title} - <span className="text-green-600">{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};

export default Applications;

