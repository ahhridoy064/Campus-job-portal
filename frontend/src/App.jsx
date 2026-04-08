import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingChatbot from "./components/FloatingChatbot";
import { AuthProvider } from "./utils/authContext";

import Home from "./pages/home";
import FindJob from "./pages/findjob";
import JobDetails from "./pages/jobdetails";
import Apply from "./pages/apply";
import About from "./pages/about";
import Skills from "./pages/skills";
import Departments from "./pages/departments";
import StudentSkills from "./pages/student-skills";
import JobSkills from "./pages/job-skills";
import Applications from "./pages/applications";
// PaymentModal is a component, not a page, so not routed here
import Contact from "./pages/contact";
import Chatbot from "./pages/chatbot";
import Terms from "./pages/terms";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import StudentDashboard from "./pages/student-dashboard";
import EmployerDashboard from "./pages/employer-dashboard";
import JobListings from "./pages/joblistings";
import StudentProfile from "./pages/student-profile";
import MyApplications from "./pages/my-applications";
import PaymentHistory from "./pages/payment-history";
import EmployerProfile from "./pages/employer-profile";
import PostJob from "./pages/post-job";
import ManageJobs from "./pages/manage-jobs";
import ApplicationsForJob from "./pages/applications-for-job";
import AdminDashboard from "./pages/admin-dashboard";
import AdminContacts from "./pages/admin-contacts";
import EmployerApplications from "./pages/employer-applications";
import StudentApplications from "./pages/student-applications";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} />
            <div className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/find-job" element={<FindJob />} />
                <Route path="/job-details/:id" element={<JobDetails />} />
                <Route path="/apply/:id" element={<Apply />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route path="/student-dashboard" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/employer-dashboard" element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/joblistings" element={<JobListings />} />
                <Route path="/student-profile" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                } />
                <Route path="/my-applications" element={
                  <ProtectedRoute requiredRole="student">
                    <MyApplications />
                  </ProtectedRoute>
                } />
                <Route path="/payment-history" element={
                  <ProtectedRoute requiredRole="student">
                    <PaymentHistory />
                  </ProtectedRoute>
                } />
                <Route path="/employer-profile" element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerProfile />
                  </ProtectedRoute>
                } />
                <Route path="/post-job" element={
                  <ProtectedRoute requiredRole="employer">
                    <PostJob />
                  </ProtectedRoute>
                } />
                <Route path="/manage-jobs" element={
                  <ProtectedRoute requiredRole="employer">
                    <ManageJobs />
                  </ProtectedRoute>
                } />
                <Route path="/applications-for-job" element={
                  <ProtectedRoute requiredRole="employer">
                    <ApplicationsForJob />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin-contacts" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminContacts />
                  </ProtectedRoute>
                } />
                <Route path="/employer-applications" element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerApplications />
                  </ProtectedRoute>
                } />
                <Route path="/student-applications" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentApplications />
                  </ProtectedRoute>
                } />
                <Route path="/skills" element={<Skills />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/student-skills" element={<StudentSkills />} />
                <Route path="/job-skills" element={<JobSkills />} />
                <Route path="/applications" element={<Applications />} />
              </Routes>
            </div>
          </div>
          <Footer />
          <FloatingChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
