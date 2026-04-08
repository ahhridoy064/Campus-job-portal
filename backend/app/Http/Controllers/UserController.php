<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\Profile;

class UserController extends Controller
{
    public function showProfile(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        return response()->json(array_merge(
            $user->toArray(),
            [
                'skills' => $profile ? $profile->skills : [],
                'resumeUrl' => $profile ? $profile->resume_url : null,
                'description' => $profile ? $profile->description : null,
            ]
        ))->header('Cache-Control', 'no-cache, no-store, must-revalidate')
          ->header('Pragma', 'no-cache')
          ->header('Expires', '0');
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:50',
            'resumeUrl' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
            'profile_image' => 'nullable|image|max:2048',
        ], [
            'profile_image.image' => 'Profile image must be a valid image file.',
            'profile_image.max' => 'Profile image cannot be larger than 2MB.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $user->name = $request->name;

            // handle profile image upload if provided
            if ($request->hasFile('profile_image')) {
                // delete previous image to avoid orphan files
                if ($user->profile_image) {
                    Storage::disk('public')->delete($user->profile_image);
                }
                $user->profile_image = $request->file('profile_image')->store('profile_images', 'public');
            }

            $user->save();

            $profileData = [
                'skills' => $request->skills ?? [],
                'resume_url' => $request->resumeUrl,
                'description' => $request->description,
            ];

            $profile = Profile::updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );

            return response()->json(['message' => 'Profile updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage());
            return response()->json(['message' => 'Could not update profile', 'error' => $e->getMessage()], 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent to your email']);
        } else {
            return response()->json(['message' => 'Unable to send password reset link'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|regex:/[!@#$%^&*(),.?":{}|<>]/|confirmed',
        ], [
            'password.min' => 'Password must be at least 8 characters long.',
            'password.regex' => 'Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>).',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(\Str::random(60));

                $user->save();
                
                // Log password reset for security audit
                \Log::info('Password reset for user: ' . $user->email);
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully']);
        } else {
            return response()->json(['message' => 'Unable to reset password. Token may have expired.'], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|regex:/[!@#$%^&*(),.?":{}|<>]/|confirmed|different:current_password',
        ], [
            'new_password.min' => 'New password must be at least 8 characters long.',
            'new_password.regex' => 'New password must contain at least one special character (!@#$%^&*(),.?\":{}|<>).',
            'new_password.confirmed' => 'Password confirmation does not match.',
            'new_password.different' => 'New password must be different from current password.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            \Log::warning('Failed password change attempt for user: ' . $user->email);
            return response()->json(['message' => 'Current password is incorrect'], 401);
        }

        // Update password
        $user->forceFill([
            'password' => Hash::make($request->new_password)
        ])->save();

        // Invalidate all tokens for security
        $user->tokens()->delete();

        \Log::info('Password changed for user: ' . $user->email);

        return response()->json(['message' => 'Password changed successfully. Please login again.', 'redirect' => 'login'], 200);
    }
}
