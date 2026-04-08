import React, { useState } from "react";
import { Lock, CheckCircle, AlertCircle, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (pwd) => {
        const errors = [];
        if (pwd.length < 8) {
            errors.push("At least 8 characters");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
            errors.push("At least one special character (!@#$%^&*(),.?\":{}|<>)");
        }
        setPasswordErrors(errors);
        return errors.length === 0;
    };

    const handleNewPasswordChange = (e) => {
        const pwd = e.target.value;
        setNewPassword(pwd);
        if (pwd) {
            validatePassword(pwd);
        } else {
            setPasswordErrors([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Client-side validation
        if (!validatePassword(newPassword)) {
            setError("Please meet all password requirements");
            setLoading(false);
            return;
        }

        if (newPassword !== newPasswordConfirmation) {
            setError("Password confirmation does not match");
            setLoading(false);
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: newPasswordConfirmation,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to change password");
                setLoading(false);
                return;
            }

            setSuccess("Password changed successfully! Redirecting to login...");
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordConfirmation("");
            setPasswordErrors([]);

            // Clear token and redirect to login
            setTimeout(() => {
                localStorage.removeItem("authToken");
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Change password error:", err);
            setError(err.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center px-2 py-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-6">
                    <Lock className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Change Password</h1>
                </div>

                {error && (
                    <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/30 rounded-xl p-4 mb-4 shadow-lg">
                        <div className="flex items-center gap-3 text-red-100">
                            <AlertCircle size={20} />
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/30 rounded-xl p-4 mb-4 shadow-lg">
                        <div className="flex items-center gap-3 text-green-100">
                            <CheckCircle size={20} />
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="password"
                            placeholder="Current Password"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                            value={newPasswordConfirmation}
                            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                        />
                    </div>

                    {/* Password Requirements Display */}
                    {newPassword && (
                        <div className="bg-blue-500/20 border border-blue-300/30 rounded-xl p-4">
                            <p className="text-sm font-medium text-blue-100 mb-3">Password Requirements:</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    {newPassword.length >= 8 ? (
                                        <Check size={16} className="text-green-400" />
                                    ) : (
                                        <X size={16} className="text-red-400" />
                                    )}
                                    <span className={newPassword.length >= 8 ? "text-green-300" : "text-red-300"}>
                                        Minimum 8 characters
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                                        <Check size={16} className="text-green-400" />
                                    ) : (
                                        <X size={16} className="text-red-400" />
                                    )}
                                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-300" : "text-red-300"}>
                                        At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {newPassword === newPasswordConfirmation && newPasswordConfirmation ? (
                                        <Check size={16} className="text-green-400" />
                                    ) : (
                                        <X size={16} className="text-red-400" />
                                    )}
                                    <span className={newPassword === newPasswordConfirmation && newPasswordConfirmation ? "text-green-300" : "text-red-300"}>
                                        Passwords match
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (passwordErrors.length > 0 && newPassword.length > 0) || newPassword !== newPasswordConfirmation && newPassword.length > 0}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Lock size={18} />
                        {loading ? "Changing..." : "Change Password"}
                    </button>
                </form>

                <div className="mt-6 text-sm text-center text-blue-200/80">
                    <a href="/student-dashboard" className="text-blue-300 hover:text-blue-200 transition-colors duration-200 underline">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </main>
    );
};

export default ChangePassword;
