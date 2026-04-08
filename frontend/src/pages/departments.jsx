import React from "react";

const Departments = () => (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-yellow-600 mb-4">Departments</h1>
            <ul className="list-disc list-inside text-gray-700">
                <li>IT</li>
                <li>Design</li>
                <li>Marketing</li>
                <li>HR</li>
                <li>Finance</li>
            </ul>
        </div>
    </main>
);

export default Departments;

