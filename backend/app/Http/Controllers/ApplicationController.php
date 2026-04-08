<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'employer') {
            // Check if employer has any jobs
            $employerJobs = \App\Models\Job::where('employer_id', $user->id)->count();
            \Log::info("Employer {$user->id} job count", ['jobs_count' => $employerJobs]);

            // Employer sees all applications for their jobs
            $applications = Application::whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })->with(['user', 'job'])->get();

            // Debug logging
            \Log::info("Employer {$user->id} fetching applications", [
                'user_role' => $user->role,
                'user_id' => $user->id,
                'jobs_count' => $employerJobs,
                'applications_count' => $applications->count(),
                'applications' => $applications->toArray()
            ]);

            // Ensure we return the data property if it exists
            if ($applications->count() > 0) {
                $firstApp = $applications->first();
                \Log::info("First application data structure", [
                    'keys' => array_keys($firstApp->toArray()),
                    'has_user' => $firstApp->relationLoaded('user'),
                    'has_job' => $firstApp->relationLoaded('job'),
                    'user_data' => $firstApp->user ? $firstApp->user->toArray() : null,
                    'job_data' => $firstApp->job ? $firstApp->job->toArray() : null
                ]);
            }
        } else {
            // Student sees their own applications
            $applications = Application::where('user_id', $user->id)->with('job')->get();

            // Debug logging
            \Log::info("Student {$user->id} fetching applications", [
                'user_role' => $user->role,
                'applications_count' => $applications->count()
            ]);
        }

        return response()->json($applications);
    }

    public function store(Request $request)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'message' => 'You must be logged in to submit an application.',
                'error' => 'Unauthenticated'
            ], 401);
        }

        $request->validate([
            'job_id' => 'required|exists:jobs,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'cover_letter' => 'nullable|string|max:1000',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120', // 5MB max
        ]);

        try {
            // Check if user already applied for this job
            $existingApplication = Application::where('user_id', Auth::id())
                ->where('job_id', $request->job_id)
                ->first();

            if ($existingApplication) {
                return response()->json([
                    'message' => 'You have already applied for this job.',
                    'error' => 'Duplicate application'
                ], 409);
            }

            // Check user balance for application fee
            $user = Auth::user();
            $applicationFee = 500;
            if ($user->balance < $applicationFee) {
                return response()->json([
                    'message' => 'Insufficient balance. Application fee is ৳' . $applicationFee . '. Your current balance: ৳' . $user->balance,
                    'error' => 'Insufficient balance'
                ], 402); // Payment Required
            }

            $resumePath = null;
            if ($request->hasFile('resume')) {
                $resumePath = $request->file('resume')->store('resumes', 'public');
            }

            $application = Application::create([
                'user_id' => Auth::id(),
                'job_id' => $request->job_id,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'cover_letter' => $request->cover_letter,
                'resume_path' => $resumePath,
                'status' => 'applied',
                'applied_at' => now(),
            ]);

            // Deduct application fee from balance
            $user->balance -= $applicationFee;
            $user->save();

            return response()->json([
                'message' => 'Application submitted successfully!',
                'application' => $application
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit application. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $application = Application::with(['user', 'job'])->find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $this->authorize('view', $application);
        return response()->json($application);
    }

    public function update(Request $request, $id)
    {
        $application = Application::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $this->authorize('update', $application);

        $request->validate([
            'status' => 'required|in:applied,shortlisted,rejected,accepted,hired',
        ]);

        $application->status = $request->status;
        $application->save();

        return response()->json($application);
    }

    public function destroy($id)
    {
        $application = Application::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $this->authorize('delete', $application);

        $application->delete();

        return response()->json(['message' => 'Application deleted']);
    }

    // Get applications for a specific job (for employers)
    public function getApplicationsForJob($jobId)
    {
        $user = Auth::user();

        // Check if user is employer and owns this job
        if ($user->role !== 'employer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $applications = Application::where('job_id', $jobId)
            ->whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })
            ->with(['user', 'job'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($applications);
    }

    // Update application status (hire/reject)
    public function updateStatus(Request $request, $id)
    {
        try {
            $application = Application::find($id);
            if (!$application) {
                \Log::warning("Application not found for status update", ['application_id' => $id]);
                return response()->json(['message' => 'Application not found'], 404);
            }

            $user = Auth::user();

            // Check if user is employer and owns the job
            if ($user->role !== 'employer' || !$application->job || $application->job->employer_id !== $user->id) {
                \Log::warning("Unauthorized status update attempt", [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'application_id' => $id,
                    'job_employer_id' => $application->job ? $application->job->employer_id : 'null'
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $request->validate([
                'status' => 'required|in:applied,shortlisted,hired,rejected,accepted',
                'feedback' => 'nullable|string|max:1000'
            ]);

            $oldStatus = $application->status;
            $application->status = $request->status;
            if ($request->has('feedback')) {
                $application->employer_feedback = $request->feedback;
            }
            $application->reviewed_at = now();
            $application->reviewed_by = $user->id;

            if ($application->save()) {
                \Log::info("Application status updated successfully", [
                    'application_id' => $id,
                    'old_status' => $oldStatus,
                    'new_status' => $request->status,
                    'employer_id' => $user->id,
                    'feedback_length' => $request->feedback ? strlen($request->feedback) : 0
                ]);

                return response()->json([
                    'message' => 'Application status updated successfully',
                    'application' => $application->load(['user', 'job'])
                ]);
            } else {
                \Log::error("Failed to save application status update", [
                    'application_id' => $id,
                    'status' => $request->status
                ]);
                return response()->json(['message' => 'Failed to update application status'], 500);
            }
        } catch (\Exception $e) {
            \Log::error("Error updating application status", [
                'application_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'An error occurred while updating the application status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get application statistics for employer
    public function getApplicationStats()
    {
        $user = Auth::user();

        if ($user->role !== 'employer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total_applications' => Application::whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })->count(),

            'pending_applications' => Application::whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })->where('status', 'applied')->count(),

            'shortlisted' => Application::whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })->where('status', 'shortlisted')->count(),

            'hired' => Application::whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })->where('status', 'hired')->count(),

            'rejected' => Application::whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })->where('status', 'rejected')->count(),
        ];

        return response()->json($stats);
    }

    // Download resume file
    public function downloadResume($id)
    {
        try {
            $application = Application::find($id);
            if (!$application) {
                \Log::warning("Resume download attempt for non-existent application", ['application_id' => $id]);
                return response()->json(['message' => 'Application not found'], 404);
            }

            $user = Auth::user();

            // Check if user is employer and owns the job, or if user is the applicant
            if ($user->role === 'employer') {
                if (!$application->job || $application->job->employer_id !== $user->id) {
                    \Log::warning("Unauthorized resume download attempt by employer", [
                        'user_id' => $user->id,
                        'application_id' => $id,
                        'job_employer_id' => $application->job ? $application->job->employer_id : 'null'
                    ]);
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'student') {
                if ($application->user_id !== $user->id) {
                    \Log::warning("Unauthorized resume download attempt by student", [
                        'user_id' => $user->id,
                        'application_id' => $id,
                        'application_user_id' => $application->user_id
                    ]);
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } else {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Check if resume exists
            if (!$application->resume_path) {
                \Log::info("Resume download attempt for application without resume", ['application_id' => $id]);
                return response()->json(['message' => 'No resume found for this application'], 404);
            }

            // Get the full path to the resume file
            $filePath = storage_path('app/public/' . $application->resume_path);

            // Check if file exists
            if (!file_exists($filePath)) {
                \Log::error("Resume file not found on disk", [
                    'application_id' => $id,
                    'resume_path' => $application->resume_path,
                    'file_path' => $filePath
                ]);
                return response()->json(['message' => 'Resume file not found'], 404);
            }

            // Get the original filename
            $originalFileName = basename($application->resume_path);

            // Log successful download
            \Log::info("Resume downloaded successfully", [
                'application_id' => $id,
                'user_id' => $user->id,
                'user_role' => $user->role,
                'file_name' => $originalFileName
            ]);

            // Return the file as download with proper headers
            return response()->download($filePath, $originalFileName, [
                'Content-Type' => mime_content_type($filePath),
                'Content-Disposition' => 'attachment; filename="' . $originalFileName . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (\Exception $e) {
            \Log::error("Error downloading resume", [
                'application_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'An error occurred while downloading the resume',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
