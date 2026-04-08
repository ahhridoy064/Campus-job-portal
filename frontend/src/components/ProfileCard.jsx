import React from "react";
import { Building2, User } from "lucide-react";

const ProfileCard = ({ name, role, skills, resumeUrl, description, logo }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                    {logo ? (
                        <img src={logo} alt={`${name} logo`} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                            {role === 'Employer' ? <Building2 size={32} className="text-gray-600" /> : <User size={32} className="text-gray-600" />}
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {role}
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {name}
                </h3>
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {skills?.map(skill => <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>)}
                </div>
                {description && <p className="text-gray-600 text-sm leading-relaxed mb-3">{description}</p>}
                {resumeUrl && <a href={resumeUrl} className="text-blue-600 hover:text-blue-700 transition-colors duration-200 underline text-sm" target="_blank" rel="noopener noreferrer">View Resume</a>}
            </div>
        </div>
    </div>
);

export default ProfileCard;
