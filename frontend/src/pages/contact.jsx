import React, { useState } from "react";
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { postContact } from "../utils/api";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        try {
            const result = await postContact(formData);
            if (result && result.message) {
                setStatus(result.message || "Message sent successfully!");
                setFormData({ name: "", email: "", message: "" });
            } else {
                setStatus("Message sent successfully!");
                setFormData({ name: "", email: "", message: "" });
            }
        } catch (error) {
            console.error('Contact submit error:', error);
            // Show detailed message if available
            setStatus(error && error.message ? error.message : "Failed to send message.");
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
            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4 drop-shadow">Contact Us</h1>
                </div>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                        <textarea
                            name="message"
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-blue-100 placeholder-blue-300/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none"
                            rows={4}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Send size={18} />
                        Send Message
                    </button>
                </form>
                {status && (
                    <div className="mt-6 flex items-center justify-center gap-3 text-blue-100">
                        {status.includes("successfully") ? (
                            <CheckCircle size={20} className="text-green-400" />
                        ) : (
                            <AlertCircle size={20} className="text-red-400" />
                        )}
                        <p className="text-center">{status}</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Contact;

