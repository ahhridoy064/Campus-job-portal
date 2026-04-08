import React, { useState, useEffect } from "react";
import { Building2, Globe, Edit3, Save, CheckCircle, AlertCircle, Loader2, User, Mail, Phone, MapPin } from "lucide-react";
import { getEmployerProfile, updateEmployerProfile } from "../utils/api";

const ProfileCard = ({ name, role, description, logo }) => (
    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center">
            <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 p-1 mx-auto">
                    {logo ? (
                        <img src={logo} alt={name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
                            <Building2 size={40} className="text-gray-600" />
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                    {role}
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {name}
                </h1>
                <p className="text-gray-600 leading-relaxed text-center">
                    {description || "No description available"}
                </p>
            </div>
        </div>
    </div>
);

const EmployerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        industry: '',
        website: '',
        description: '',
        company_logo: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getEmployerProfile();
                setProfile(data);
                setFormData({
                    company_name: data.company_name || '',
                    industry: data.industry || '',
                    website: data.website || '',
                    description: data.description || '',
                    company_logo: data.company_logo || ''
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            await updateEmployerProfile(formData);
            setSuccess('Profile updated successfully!');
            setProfile(formData);
            setIsEditing(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Company Profile</h1>
                    <p className="text-lg text-gray-600">Manage your company information and branding</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                        <div className="flex items-center gap-3 text-green-800">
                            <CheckCircle size={20} />
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                        <div className="flex items-center gap-3 text-red-800">
                            <AlertCircle size={20} />
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <ProfileCard
                                name={profile?.company_name || profile?.name || 'Company'}
                                role="Employer"
                                description={profile?.description}
                                logo={profile?.company_logo}
                            />
                        </div>
                    </div>

                    {/* Right Column - Profile Details and Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
                                    <p className="text-gray-600">Manage your company details and branding</p>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <Edit3 size={18} />
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Company Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                placeholder="Enter company name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Industry
                                            </label>
                                            <input
                                                type="text"
                                                name="industry"
                                                placeholder="Enter industry"
                                                value={formData.industry}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Globe size={16} />
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            placeholder="https://example.com"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Company Logo URL
                                        </label>
                                        <input
                                            type="url"
                                            name="company_logo"
                                            placeholder="https://example.com/logo.png"
                                            value={formData.company_logo}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            placeholder="Tell us about your company..."
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="5"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError(null);
                                                setSuccess(null);
                                            }}
                                            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Company Name
                                            </label>
                                            <p className="text-gray-900 text-xl font-medium">
                                                {profile?.company_name || 'Not specified'}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Industry
                                            </label>
                                            <p className="text-gray-900 text-xl">
                                                {profile?.industry || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Globe size={16} />
                                            Website
                                        </label>
                                        {profile?.website ? (
                                            <a
                                                href={profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline text-xl inline-block"
                                            >
                                                {profile.website}
                                            </a>
                                        ) : (
                                            <p className="text-gray-500 text-xl">Not specified</p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <div className="bg-gray-50 rounded-lg p-6">
                                            <p className="text-gray-900 text-lg leading-relaxed">
                                                {profile?.description || 'No description available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerProfile;