<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;

class JobApplicationController extends Controller
{
    /**
     * List all applications for a specific job posting.
     * GET /job-postings/{job_id}/applications
     */
    public function index($job_id)
    {
        $job = JobPosting::find($job_id);

        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        $applications = JobApplication::where('job_id', $job_id)
            ->whereNull('deleted_at')
            ->with(['applicant:user_id,first_name,middle_name,last_name,email,contact_number,avatar'])
            ->latest()
            ->get()
            ->map(function ($app) {
                return [
                    'application_id' => $app->application_id,
                    'user_id'        => $app->applicant_id,
                    'first_name'     => $app->applicant->first_name,
                    'middle_name'    => $app->applicant->middle_name,
                    'last_name'      => $app->applicant->last_name,
                    'email'          => $app->applicant->email,
                    'contact_number' => $app->applicant->contact_number,
                    'avatar'         => $app->applicant->avatar,
                    'cover_letter'   => $app->cover_letter,
                    'resume_url'     => $app->resume_url,
                    'status'         => $app->status,
                    'applied_at'     => $app->created_at,
                ];
            });

        return response()->json($applications);
    }

    /**
     * Submit an application (applicant only).
     * POST /job-postings/{job_id}/applications
     */
    public function store(Request $request, $job_id)
    {
        $job = JobPosting::find($job_id);

        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        if ($job->status !== 'open') {
            return response()->json(['message' => 'This job is no longer accepting applications'], 422);
        }

        // Prevent duplicate applications
        $existing = JobApplication::where('job_id', $job_id)
            ->where('applicant_id', $request->user()->user_id)
            ->whereNull('deleted_at')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already applied for this job'], 422);
        }

        $validator = Validator::make($request->all(), [
            'cover_letter' => 'nullable|string',
            'resume_url'   => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = JobApplication::create([
            'job_id'       => $job_id,
            'applicant_id' => $request->user()->user_id,
            'cover_letter' => $request->cover_letter,
            'resume_url'   => $request->resume_url,
            'status'       => 'pending',
        ]);

        return response()->json([
            'message'     => 'Application submitted successfully',
            'application' => $application,
        ], 201);
    }

    /**
     * Update application status (employer only).
     * PATCH /applications/{application_id}/status
     */
    public function updateStatus(Request $request, $application_id)
    {
        $application = JobApplication::find($application_id);

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        // Make sure the authenticated user owns the job
        $job = JobPosting::find($application->job_id);

        if (!$job || $job->employer_id !== $request->user()->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,reviewed,shortlisted,rejected,hired',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status updated successfully',
            'status'  => $application->status,
        ]);
    }

    /**
     * Get all applications submitted by the logged-in applicant.
     * GET /my-applications
     *
     * Only returns applications where the job still exists (not soft-deleted).
     * The frontend also handles null jobs gracefully as a second safety net.
     */
    public function myApplications(Request $request)
    {
        $applications = JobApplication::where('applicant_id', $request->user()->user_id)
            ->whereNull('deleted_at')
            ->whereHas('job') // ← only include applications whose job still exists
            ->with(['job:job_id,job_title,company_name,company_logo,location,job_type,salary_range,status'])
            ->latest()
            ->get()
            ->map(function ($app) {
                return [
                    'application_id' => $app->application_id,
                    'job'            => $app->job,
                    'cover_letter'   => $app->cover_letter,
                    'resume_url'     => $app->resume_url,
                    'status'         => $app->status,
                    'applied_at'     => $app->created_at,
                ];
            });

        return response()->json($applications);
    }

    public function destroy(Request $request, $application_id)
    {
        $application = JobApplication::where('application_id', $application_id)
            ->where('applicant_id', $request->user()->user_id)
            ->whereNull('deleted_at')
            ->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        // Optional: prevent withdrawal if already hired
        if ($application->status === 'hired') {
            return response()->json(['message' => 'Cannot withdraw a hired application'], 422);
        }

        $application->delete(); // soft delete

        return response()->json(['message' => 'Application withdrawn successfully']);
    }
}