<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Job;
use App\Models\Application;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalStudents = User::where('role', 'student')->count();
        $totalEmployers = User::where('role', 'employer')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalJobs = Job::count();
        $totalApplications = Application::count();
        $totalRevenue = Payment::sum('amount') ?? 0;

        // Recent activities - handle potential empty results
        $recentUsers = User::latest()->take(5)->get();
        $recentJobs = Job::take(5)->get(); // Job model has timestamps disabled
        $recentApplications = Application::with(['user', 'job'])->take(5)->get();

        return response()->json([
            'total_students' => $totalStudents,
            'total_employers' => $totalEmployers,
            'total_admins' => $totalAdmins,
            'total_jobs' => $totalJobs,
            'total_applications' => $totalApplications,
            'total_revenue' => $totalRevenue,
            'recent_users' => $recentUsers,
            'recent_jobs' => $recentJobs,
            'recent_applications' => $recentApplications,
        ]);
    }

    public function getUsers(Request $request)
    {
        $query = User::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Pagination
        $users = $query->paginate(10);

        return response()->json($users);
    }

    public function blockUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from blocking other admins
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot block admin users'], 403);
        }

        $user->update(['is_blocked' => !$user->is_blocked]);

        return response()->json([
            'message' => $user->is_blocked ? 'User blocked successfully' : 'User unblocked successfully',
            'user' => $user
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from deleting other admins
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin users'], 403);
        }

        // Delete related records
        $user->applications()->delete();
        $user->payments()->delete();
        $user->tokens()->delete();

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function getJobs(Request $request)
    {
        $query = Job::with('user');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('company', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Pagination
        $jobs = $query->paginate(10);

        return response()->json($jobs);
    }

    public function deleteJob(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        // Delete related applications
        $job->applications()->delete();

        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }

    public function getStatistics()
    {
        $statistics = [
            'user_growth' => User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'job_growth' => Job::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'application_trends' => Application::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'revenue_by_month' => Payment::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as revenue')
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            'top_companies' => Job::selectRaw('company, COUNT(*) as job_count')
                ->groupBy('company')
                ->orderBy('job_count', 'desc')
                ->take(10)
                ->get(),

            'top_locations' => Job::selectRaw('location, COUNT(*) as job_count')
                ->groupBy('location')
                ->orderBy('job_count', 'desc')
                ->take(10)
                ->get(),
        ];

        return response()->json($statistics);
    }

    public function getEmployersWithJobs()
    {
        $employers = User::where('role', 'employer')
            ->with(['employerProfile', 'jobs' => function($query) {
                $query->latest()->take(3); // Get latest 3 jobs per employer
            }])
            ->withCount('jobs')
            ->get()
            ->map(function($employer) {
                return [
                    'id' => $employer->id,
                    'name' => $employer->name,
                    'email' => $employer->email,
                    'created_at' => $employer->created_at,
                    'is_blocked' => $employer->is_blocked,
                    'jobs_count' => $employer->jobs_count,
                    'recent_jobs' => $employer->jobs->map(function($job) {
                        return [
                            'id' => $job->id,
                            'title' => $job->title,
                            'company' => $job->company,
                            'location' => $job->location,
                            'type' => $job->type,
                            'created_at' => $job->created_at,
                        ];
                    }),
                    'employer_profile' => $employer->employerProfile ? [
                        'company_name' => $employer->employerProfile->company_name,
                        'industry' => $employer->employerProfile->industry,
                        'company_size' => $employer->employerProfile->company_size,
                    ] : null,
                ];
            });

        return response()->json($employers);
    }

    public function getActiveEmployers()
    {
        $employers = User::where('role', 'employer')
            ->where('is_blocked', false)
            ->with('employerProfile')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($employer) {
                return [
                    'id' => $employer->id,
                    'name' => $employer->name,
                    'email' => $employer->email,
                    'created_at' => $employer->created_at,
                    'is_blocked' => $employer->is_blocked,
                    'company_name' => $employer->employerProfile ? $employer->employerProfile->company_name : null,
                    'industry' => $employer->employerProfile ? $employer->employerProfile->industry : null,
                    'company_size' => $employer->employerProfile ? $employer->employerProfile->company_size : null,
                ];
            });

        return response()->json($employers);
    }

    public function getRecentUsers()
    {
        $recentUsers = User::latest()->take(10)->get();
        return response()->json($recentUsers);
    }

    public function getRecentJobs()
    {
        $recentJobs = Job::with('user')->latest()->take(10)->get();
        return response()->json($recentJobs);
    }

    public function getRecentApplications()
    {
        $recentApplications = Application::with(['user', 'job'])
            ->latest()
            ->take(10)
            ->get();
        return response()->json($recentApplications);
    }
}
