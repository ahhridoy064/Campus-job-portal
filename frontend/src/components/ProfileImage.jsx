import React from 'react';
import { User } from 'lucide-react';

const ProfileImage = ({ user, className = '' }) => {
    if (!user) return null;

    const imageUrl = user.profile_image 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.profile_image}`
        : null;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {imageUrl ? (
                <div className="relative">
                    <img 
                        src={imageUrl} 
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-400 shadow-lg"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                        }}
                    />
                    <div 
                        className="hidden w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-4 border-blue-400 shadow-lg items-center justify-center"
                        style={{ display: 'none' }}
                    >
                        <User className="w-12 h-12 text-white" />
                    </div>
                </div>
            ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-4 border-blue-400 shadow-lg flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                </div>
            )}
            <p className="mt-4 text-lg font-semibold text-white">{user.name}</p>
            <p className="text-sm text-blue-300 capitalize">{user.role}</p>
        </div>
    );
};

export default ProfileImage;
