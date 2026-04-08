import React, { useState } from "react";
import Button from "../components/Button";
import { login } from "../utils/api";
import { useAuth } from "../utils/authContext";
import { Mail, Lock, LogIn } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login: authLogin } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const data = await login(email, password);

            // Use auth context login method
            authLogin(data.user, data.access_token, data.user.role);

            // Redirect based on user role
            if (data.user.role === 'admin') {
                window.location.href = "/admin-dashboard";
            } else if (data.user.role === 'employer') {
                window.location.href = "/employer-dashboard";
            } else if (data.user.role === 'student') {
                window.location.href = "/student-dashboard";
            } else {
                window.location.href = "/student-dashboard"; // Default fallback
            }
        } catch (err) {
            // show any message returned by the API (or network error) so user knows what failed
            console.error('login error', err);
            let message = 'Login failed';
            if (err && err.message) {
                message = err.message;
            }
            setError(message);
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
                    <LogIn className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Login</h1>
                </div>
                {error && (
                    <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/30 rounded-xl p-4 mb-4 shadow-lg">
                        <div className="flex items-center gap-3 text-red-100">
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-blue-200/80">
                        <input type="checkbox" className="accent-blue-400" />
                        Save Password
                    </label>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <LogIn size={18} />
                        Login
                    </button>
                </form>
                <div className="flex justify-between mt-6 text-sm text-blue-200/80">
                    <a href="/register" className="text-blue-300 hover:text-blue-200 transition-colors duration-200 underline">Register</a>
                    <a href="/forgot-password" className="text-blue-300 hover:text-blue-200 transition-colors duration-200 underline">Forgot Password?</a>
                </div>
            </div>
        </main>
    );
};

export default Login;

