<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Resume download route - protected by auth middleware
Route::middleware('auth:sanctum')->get('/api/applications/{id}/download-resume', [App\Http\Controllers\ApplicationController::class, 'downloadResume']);
