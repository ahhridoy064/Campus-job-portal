import React, { useEffect, useState } from "react";
import ProfileCard from "../components/ProfileCard";
import { getProfile, updateProfile } from "../utils/api";
import { User, Save, Loader2, AlertCircle } from "lucide-react";

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", skills: "", resumeUrl: "", description: "" });
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        // Check authentication (token in localStorage)
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        // Fetch profile data
        getProfile()
            .then(data => {
                setProfile(data);
                setForm({
                    name: data.name || "",
                    email: data.email || "",
                    skills: data.skills ? data.skills.join(", ") : "",
                    resumeUrl: data.resumeUrl || "",
                    description: data.description || ""
                });
                // keep existing image path for preview or future uploads
                setProfileImage(null); // clear any file selected previously
            })
            .catch(() => {
                setError("Failed to load profile");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const updateData = {
                name: form.name,
                skills: form.skills.split(",").map(s => s.trim()),
                resumeUrl: form.resumeUrl,
                description: form.description,
            };
            if (profileImage) {
                updateData.profile_image = profileImage;
            }
            await updateProfile(updateData);
            setSuccess("Profile updated!");
            setProfileImage(null);
        } catch (err) {
            setError("Could not update profile");
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="mt-2 text-gray-600">Manage your profile information and settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <ProfileCard
                            name={form.name}
                            role="Student"
                            skills={form.skills.split(",").map(s => s.trim()).filter(s => s)}
                            resumeUrl={form.resumeUrl}
                            description={form.description}
                            logo={
                                profile && profile.profile_image
                                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${profile.profile_image}`
                                    : null
                            }
                        />
                    </div>

                    {/* Edit Profile Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <User size={24} className="text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm">{success}</p>
                                </div>
                            )}

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setProfileImage(e.target.files[0])}
                                        className="w-full text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Skills
                                    </label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={form.skills}
                                        onChange={handleChange}
                                        placeholder="e.g., React, JavaScript, Python (comma separated)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resume URL
                                    </label>
                                    <input
                                        type="url"
                                        name="resumeUrl"
                                        value={form.resumeUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/your-resume.pdf"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Optional: Link to your resume or portfolio</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Tell us about yourself, your experience, and what you're looking for..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows="4"
                                    ></textarea>
                                    <p className="text-xs text-gray-500 mt-1">Optional: Brief description about yourself</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;

