<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\EmployerProfile;

class EmployerProfileController extends Controller
{
    public function showProfile(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->role !== 'employer') {
                return response()->json(['error' => 'Forbidden: Only employers can access this resource'], 403);
            }

            $employerProfile = $user->employerProfile;

            return response()->json(array_merge(
                $user->toArray(),
                $employerProfile ? $employerProfile->toArray() : []
            ))->header('Cache-Control', 'no-cache, no-store, must-revalidate')
              ->header('Pragma', 'no-cache')
              ->header('Expires', '0');
        } catch (\Exception $e) {
            \Log::error('Error fetching employer profile: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch employer profile', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json(['error' => 'Forbidden: Only employers can update this resource'], 403);
        }

        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
            'company_logo' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $profileData = [
                'user_id' => $user->id,
                'company_name' => $request->company_name,
                'industry' => $request->industry,
                'website' => $request->website,
                'description' => $request->description,
                'company_logo' => $request->company_logo,
            ];

            $employerProfile = EmployerProfile::updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );

            return response()->json(['message' => 'Employer profile updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Employer profile update error: ' . $e->getMessage());
            return response()->json(['message' => 'Could not update employer profile', 'error' => $e->getMessage()], 500);
        }
    }
}
