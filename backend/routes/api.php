<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\EmployerProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatbotController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Registration - open to everyone
Route::post('/users/register', function (Request $request) {
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => [
            'required',
            'string',
            'min:8',
            'regex:/[!@#$%^&*()\-_.,?"\'{}<>|]/i',
            'confirmed'
        ],
        'role' => 'required|in:student,employer,admin',
        'profile_image' => 'nullable|image|max:2048',
    ], [
        'password.min' => 'Password must be at least 8 characters long.',
        'password.regex' => 'Password must contain at least one special character.',
        'password.confirmed' => 'Password confirmation does not match.',
        'profile_image.image' => 'Profile image must be a valid image file.',
        'profile_image.max' => 'Profile image cannot be larger than 2MB.',
    ]);

    $profileImagePath = null;
    if ($request->hasFile('profile_image')) {
        $profileImagePath = $request->file('profile_image')->store('profile_images', 'public');
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => $request->role,
        'profile_image' => $profileImagePath,
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user,
        'message' => 'Registration successful',
    ]);
});

// Login - open to everyone with brute force protection
Route::post('/users/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // Brute force protection: Throttle login attempts
    $throttleKey = 'login_attempts:' . $request->ip() . ':' . $request->email;
    $maxAttempts = 5;
    $decayMinutes = 15;

    // Check if user has exceeded login attempts
    if (Cache::has($throttleKey)) {
        $attempts = Cache::get($throttleKey);
        if ($attempts >= $maxAttempts) {
            return response()->json([
                'message' => 'Too many login attempts. Please try again in ' . $decayMinutes . ' minutes.'
            ], 429);
        }
    }

    $user = User::where('email', $request->email)->first();

    // Check if user is blocked
    if ($user && $user->is_blocked) {
        Log::warning('Login attempt for blocked user: ' . $request->email);
        return response()->json(['message' => 'Your account has been blocked'], 403);
    }

    if (! $user || ! Hash::check($request->password, $user->password)) {
        // Increment failed attempts
        $attempts = Cache::get($throttleKey, 0) + 1;
        Cache::put($throttleKey, $attempts, now()->addMinutes($decayMinutes));
        
        Log::warning('Failed login attempt for email: ' . $request->email . ' from IP: ' . $request->ip());
        return response()->json(['message' => 'Invalid email or password'], 401);
    }

    // Clear attempts on successful login
    Cache::forget($throttleKey);

    $token = $user->createToken('auth_token')->plainTextToken;

    Log::info('User logged in: ' . $user->email);

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user->only(['id', 'name', 'email', 'role', 'profile_image', 'created_at']),
        'message' => 'Login successful',
    ]);
});

Route::prefix('users')->group(function () {
    // Forgot Password
    Route::post('/forgot-password', [UserController::class, 'forgotPassword']);

    // Reset Password
    Route::post('/reset-password', [UserController::class, 'resetPassword']);
    
    // Change Password (protected)
    Route::middleware('auth:sanctum')->post('/change-password', [UserController::class, 'changePassword']);
});

// Get Authenticated User Profile
Route::middleware('auth:sanctum')->get('/users/me', [UserController::class, 'showProfile']);

// Update Authenticated User Profile
Route::middleware('auth:sanctum')->put('/users/me', [UserController::class, 'updateProfile']);

// Employer Profile Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('employer-profile', [EmployerProfileController::class, 'showProfile']);
    Route::put('employer-profile', [EmployerProfileController::class, 'updateProfile']);
});

// Logout
Route::middleware('auth:sanctum')->post('/users/logout', function (Request $request) {
    $request->user()->tokens()->delete();
    return response()->json(['message' => 'Logged out']);
});

// Job Routes
Route::get('jobs', [JobController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('jobs', [JobController::class, 'store']);
    Route::get('jobs/{id}', [JobController::class, 'show']);
    Route::put('jobs/{id}', [JobController::class, 'update']);
    Route::delete('jobs/{id}', [JobController::class, 'destroy']);
    Route::get('employer/stats', [JobController::class, 'getEmployerStats']);
    Route::apiResource('applications', ApplicationController::class);

    // Additional application routes for employers
    Route::get('applications/job/{jobId}', [ApplicationController::class, 'getApplicationsForJob']);
    Route::put('applications/{id}/status', [ApplicationController::class, 'updateStatus']);
    Route::get('applications/stats/overview', [ApplicationController::class, 'getApplicationStats']);
    Route::apiResource('payments', PaymentController::class);

    // Admin Routes - Protected by admin role middleware
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\AdminController::class, 'dashboard']);
        Route::get('users', [\App\Http\Controllers\AdminController::class, 'getUsers']);
        Route::put('users/{id}/block', [\App\Http\Controllers\AdminController::class, 'blockUser']);
        Route::delete('users/{id}', [\App\Http\Controllers\AdminController::class, 'deleteUser']);
        Route::get('jobs', [\App\Http\Controllers\AdminController::class, 'getJobs']);
        Route::delete('jobs/{id}', [\App\Http\Controllers\AdminController::class, 'deleteJob']);
        Route::get('statistics', [\App\Http\Controllers\AdminController::class, 'getStatistics']);
        Route::get('employers-with-jobs', [\App\Http\Controllers\AdminController::class, 'getEmployersWithJobs']);
        Route::get('active-employers', [\App\Http\Controllers\AdminController::class, 'getActiveEmployers']);

        // Recent activity routes
        Route::get('recent-users', [\App\Http\Controllers\AdminController::class, 'getRecentUsers']);
        Route::get('recent-jobs', [\App\Http\Controllers\AdminController::class, 'getRecentJobs']);
        Route::get('recent-applications', [\App\Http\Controllers\AdminController::class, 'getRecentApplications']);

        // Contact management routes
        Route::get('contacts', [ContactController::class, 'index']);
        Route::get('contacts/{id}', [ContactController::class, 'show']);
        Route::delete('contacts/{id}', [ContactController::class, 'destroy']);
    });
});

// Contact form route
Route::post('contact', [ContactController::class, 'store']);

// Chatbot routes
Route::post('chatbot/send-message', [ChatbotController::class, 'sendMessage']);
Route::post('chatbot/search-jobs', [ChatbotController::class, 'searchJobs']);
