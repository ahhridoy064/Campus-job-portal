<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    // List all jobs
    public function index()
    {
        $jobs = Job::with('employer')->withCount('applications')->get();
        return response()->json($jobs);
    }

    // Show a single job
    public function show($id)
    {
        $job = Job::with('employer')->withCount('applications')->find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }
        return response()->json($job);
    }

    // Create a new job
    public function store(Request $request)
    {
        if ($request->user()->role !== 'employer') {
            return response()->json(['error' => 'Forbidden: Only employers can post jobs'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'salary' => 'required|numeric',
            'type' => 'required|in:Part-time,Permanent,Internship',
            'description' => 'nullable|string',
        ]);

        try {
            $job = Job::create([
                'title' => $request->title,
                'company' => $request->company,
                'location' => $request->location,
                'salary' => $request->salary,
                'type' => $request->type,
                'description' => $request->description,
                'employer_id' => $request->user()->id,
            ]);

            return response()->json($job, 201);
        } catch (\Exception $e) {
            \Log::error('Job creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create job', 'details' => $e->getMessage()], 500);
        }
    }

    // Update a job
    public function update(Request $request, $id)
    {
        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        $this->authorize('update', $job);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'company' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'salary' => 'sometimes|required|numeric',
            'type' => 'sometimes|required|in:Part-time,Permanent,Internship',
            'description' => 'nullable|string',
        ]);

        try {
            $job->update([
                'title' => $request->title,
                'company' => $request->company,
                'location' => $request->location,
                'salary' => $request->salary,
                'type' => $request->type,
                'description' => $request->description,
            ]);

            return response()->json($job);
        } catch (\Exception $e) {
            \Log::error('Job update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update job', 'details' => $e->getMessage()], 500);
        }
    }

    // Delete a job
    public function destroy($id)
    {
        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        $this->authorize('delete', $job);

        $job->delete();

        return response()->json(['message' => 'Job deleted']);
    }

    // Get employer job statistics
    public function getEmployerStats(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json(['error' => 'Forbidden: Only employers can view stats'], 403);
        }

        try {
            // Get total jobs posted by this employer
            $totalJobs = Job::where('employer_id', $user->id)->count();

            // Get active jobs (not deleted, assuming no soft deletes for now)
            $activeJobs = Job::where('employer_id', $user->id)->count();

            // Get total applications for all jobs by this employer
            $totalApplications = Job::where('employer_id', $user->id)
                ->withCount('applications')
                ->get()
                ->sum('applications_count');

            // Get today's views (this would need a views tracking system)
            // For now, we'll use a placeholder
            $viewsToday = 0;

            return response()->json([
                'total_jobs' => $totalJobs,
                'active_jobs' => $activeJobs,
                'total_applications' => $totalApplications,
                'views_today' => $viewsToday
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch employer stats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch statistics'], 500);
        }
    }
}
