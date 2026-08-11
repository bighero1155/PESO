<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobPostingController;
use App\Http\Controllers\CdspScheduleController;
use Illuminate\Support\Facades\Auth;

// ── Auth ──────────────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ── Email Verification ────────────────────────────────────────────────────────
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

Route::post('/email/resend', [AuthController::class, 'resendVerification'])
    ->middleware('throttle:6,1');

// ── Public ────────────────────────────────────────────────────────────────────
Route::get('/public/users/{user_id}', [UserController::class, 'publicProfile']);

Route::get('/config', function () {
    return response()->json([
        'apiBaseUrl' => config('app.url') . '/api',
    ]);
});

// CDSP Schedules — public read
Route::get('/cdsp-schedules', [CdspScheduleController::class, 'index']);
Route::get('/cdsp-schedules/{id}', [CdspScheduleController::class, 'show']);

// ── Protected ─────────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/user-role', function () {
        return response()->json(['role' => Auth::user()->role]);
    });

    Route::get('/users/{user_id}', [UserController::class, 'show']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user_id}', [UserController::class, 'update']);
    Route::delete('/users/{user_id}', [UserController::class, 'destroy']);
    Route::post('/users/{user_id}/progress', [UserController::class, 'updateProgress']);
    Route::put('/users/{id}/score', [UserController::class, 'updateScore']);
    Route::get('/leaderboard', [UserController::class, 'leaderboard']);

    // ── Job Postings ──────────────────────────────────────────────────────────
    Route::get('/job-postings', [JobPostingController::class, 'index']);
    Route::post('/job-postings', [JobPostingController::class, 'store']);
    Route::get('/job-postings/{job_id}', [JobPostingController::class, 'show']);
    Route::put('/job-postings/{job_id}', [JobPostingController::class, 'update']);
    Route::delete('/job-postings/{job_id}', [JobPostingController::class, 'destroy']);

    // ── Job Applications ──────────────────────────────────────────────────────
    Route::get('/job-postings/{job_id}/applications', [JobApplicationController::class, 'index']);
    Route::post('/job-postings/{job_id}/applications', [JobApplicationController::class, 'store']);
    Route::patch('/applications/{application_id}/status', [JobApplicationController::class, 'updateStatus']);
    Route::get('/my-applications', [JobApplicationController::class, 'myApplications']);
    Route::delete('/my-applications/{application_id}', [JobApplicationController::class, 'destroy']);

    // ── CDSP Schedules — admin write ──────────────────────────────────────────
    Route::post('/cdsp-schedules', [CdspScheduleController::class, 'store']);
    Route::put('/cdsp-schedules/{id}', [CdspScheduleController::class, 'update']);
    Route::delete('/cdsp-schedules/{id}', [CdspScheduleController::class, 'destroy']);
});