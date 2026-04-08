import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const JobCard = ({ id, title, company, location, salary, type }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/job-details/${id}`);
    };

    const handleApplyClick = () => {
        console.log('Apply button clicked for job:', id);
        navigate(`/apply/${id}`);
    };

    return (
        <div className="relative group h-full">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-500 hover:scale-[1.03] hover:shadow-blue-500/20 group-hover:shadow-2xl h-full">
                {/* Header with title and company */}
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-blue-300 group-hover:text-blue-200 transition-colors duration-300 leading-tight line-clamp-2">{title}</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">{company}</span>
                    </div>
                    <div className="text-slate-500 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {location}
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    <span className="bg-gradient-to-r from-blue-600/40 to-blue-500/40 text-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-500/30 backdrop-blur-sm">
                        {type}
                    </span>
                    {salary && (
                        <span className="bg-gradient-to-r from-green-600/40 to-emerald-500/40 text-green-200 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-500/30 backdrop-blur-sm">
                            ৳ {salary}
                        </span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-auto pt-4">
                    <Button
                        onClick={handleApplyClick}
                        variant="primary"
                        className="flex-1 text-sm py-2.5"
                    >
                        Apply Now
                    </Button>
                    <Button
                        onClick={handleViewDetails}
                        variant="secondary"
                        className="flex-1 text-sm py-2.5"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
