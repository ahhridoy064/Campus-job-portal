import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { postApplication, getJob } from "../utils/api";
import { Send, Loader2, AlertCircle, ArrowLeft, FileText, User, Mail } from "lucide-react";

const Apply = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        coverLetter: "",
        resume: null
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const jobData = await getJob(id);
                setJob(jobData);
            } catch (err) {
                setError("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            resume: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        // Client-side validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            setErrorMessage("Please fill in all required fields.");
            setSubmitting(false);
            return;
        }

        if (formData.coverLetter.length > 1000) {
            setErrorMessage("Cover letter must be less than 1000 characters.");
            setSubmitting(false);
            return;
        }

        if (formData.resume && formData.resume.size > 5 * 1024 * 1024) {
            setErrorMessage("Resume file size must be less than 5MB.");
            setSubmitting(false);
            return;
        }

        try {
            const applicationData = new FormData();
            applicationData.append('job_id', id);
            applicationData.append('first_name', formData.firstName);
            applicationData.append('last_name', formData.lastName);
            applicationData.append('email', formData.email);
            applicationData.append('phone', formData.phone);
            applicationData.append('cover_letter', formData.coverLetter);
            if (formData.resume) {
                applicationData.append('resume', formData.resume);
            }

            await postApplication(applicationData);

            setSuccessMessage("Application submitted successfully!");
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                coverLetter: "",
                resume: null
            });

            // Reset file input
            const fileInput = document.getElementById('resume');
            if (fileInput) fileInput.value = '';

            setTimeout(() => {
                navigate('/my-applications');
            }, 2000);
        } catch (err) {
            console.error('Application submission error:', err);

            // Handle specific error types
            if (err.message.includes('401') || err.message.includes('Unauthenticated')) {
                setErrorMessage("You must be logged in to submit an application. Please log in and try again.");
            } else if (err.message.includes('409') || err.message.includes('Duplicate')) {
                setErrorMessage("You have already applied for this job.");
            } else if (err.message.includes('Insufficient balance')) {
                setErrorMessage("Insufficient account balance. Pay First");
            } else if (err.message.includes('422') || err.message.includes('validation')) {
                setErrorMessage("Please check your form fields and try again.");
            } else if (err.message.includes('500')) {
                setErrorMessage("Server error occurred. Please try again later.");
            } else {
                setErrorMessage("Failed to submit application. Please check your connection and try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl shadow-blue-900/30 relative z-10 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-6 text-white">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300/50 rounded-full animate-spin animation-delay-300"></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Loading Application Form</h3>
                        <p className="text-blue-200">Please wait while we prepare your application...</p>
                    </div>
                </div>
            </div>
        </main>
    );

    if (error) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="bg-white/8 backdrop-blur-xl border border-red-400/20 rounded-3xl p-12 shadow-2xl shadow-red-900/20 relative z-10 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-6 text-white">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-400/30">
                        <AlertCircle size={32} className="text-red-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2 text-red-200">Error Loading Job</h3>
                        <p className="text-red-300">{error}</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-200 hover:text-red-100 transition-all duration-300 hover:scale-105"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </main>
    );

    if (!job) return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
            <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl shadow-blue-900/30 relative z-10 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-6 text-white">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
                        <FileText size={32} className="text-blue-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Job Not Found</h3>
                        <p className="text-blue-200">The job you're trying to apply for doesn't exist.</p>
                    </div>
                    <button
                        onClick={() => navigate('/joblistings')}
                        className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-200 hover:text-blue-100 transition-all duration-300 hover:scale-105"
                    >
                        Browse Jobs
                    </button>
                </div>
            </div>
        </main>
    );

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 px-4 py-8">
                {/* Back Button */}
                <div className="mb-6 animate-in slide-in-from-left duration-500">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors duration-300"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                </div>

                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 animate-in zoom-in-95 duration-500 delay-200">
                        {/* Header */}
                        <div className="text-center mb-8 animate-in slide-in-from-top duration-500 delay-300">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Apply for Position</h1>
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-300" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                                    <p className="text-blue-200">{job.company}</p>
                                </div>
                            </div>
                            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom duration-500 delay-500">
                            {/* Personal Information */}
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-blue-300">Personal Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-white mb-2 font-semibold">
                                            First Name *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full p-4 pl-12 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                                                placeholder="Enter your first name"
                                                required
                                            />
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block text-white mb-2 font-semibold">
                                            Last Name *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full p-4 pl-12 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                                                placeholder="Enter your last name"
                                                required
                                            />
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-white mb-2 font-semibold">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full p-4 pl-12 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                                                placeholder="Enter your email address"
                                                required
                                            />
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-white mb-2 font-semibold">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full p-4 pl-12 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                                                placeholder="Enter your phone number"
                                            />
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resume Upload */}
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-blue-300">Resume/CV</h3>
                                </div>

                                <div className="border-2 border-dashed border-blue-400/30 rounded-xl p-8 text-center hover:border-blue-400/50 transition-colors duration-300">
                                    <input
                                        type="file"
                                        id="resume"
                                        name="resume"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                    <label htmlFor="resume" className="cursor-pointer">
                                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
                                            <FileText className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <p className="text-white font-semibold mb-2">Upload Resume/CV</p>
                                        <p className="text-blue-200 text-sm">PDF, DOC, or DOCX (Max 5MB)</p>
                                        <p className="text-blue-300 text-xs mt-2">Click to browse files</p>
                                    </label>
                                    {formData.resume && (
                                        <p className="text-green-300 text-sm mt-4">Selected: {formData.resume.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Cover Letter */}
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-blue-300">Cover Letter</h3>
                                </div>

                                <div>
                                    <label htmlFor="coverLetter" className="block text-white mb-3 font-semibold">
                                        Why are you interested in this position? *
                                    </label>
                                    <textarea
                                        id="coverLetter"
                                        name="coverLetter"
                                        value={formData.coverLetter}
                                        onChange={handleInputChange}
                                        className="w-full p-6 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/20 hover:border-white/30 resize-none"
                                        rows={8}
                                        placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                        required
                                    />
                                    <div className="text-right mt-2">
                                        <span className="text-blue-300/60 text-sm">
                                            {formData.coverLetter.length}/1000 characters
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="space-y-4">
                                {errorMessage && (
                                    <div className="animate-in slide-in-from-left duration-300">
                                        <p className="text-red-300 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-4 flex items-center gap-3 shadow-lg">
                                            <div className="w-5 h-5 bg-red-400/30 rounded-full flex items-center justify-center">
                                                <span className="text-red-300 text-xs">!</span>
                                            </div>
                                            {errorMessage}
                                        </p>
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        <p className="text-green-300 bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-xl p-4 flex items-center gap-3 shadow-lg">
                                            <div className="w-5 h-5 bg-green-400/30 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                </svg>
                                            </div>
                                            {successMessage}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Fee Notice */}
                            <div className="text-center py-4">
                                <p className="text-blue-200 bg-blue-500/10 backdrop-blur-md border border-blue-400/20 rounded-xl p-4">
                                    <span className="font-semibold">Application Fee: ৳500</span><br />
                                    Ensure your account has sufficient balance before submitting.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-center pt-6">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-3 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Send size={20} />
                                        )}
                                    </div>
                                    <span>
                                        {submitting ? "Submitting Application..." : "Submit Application"}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Apply;