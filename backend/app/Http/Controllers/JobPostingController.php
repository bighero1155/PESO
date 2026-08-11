<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class JobPostingController extends Controller
{
    // List all open jobs (for applicants) or employer's own jobs
    public function index(Request $request)
    {
        if ($request->has('employer_id')) {
            $jobs = JobPosting::where('employer_id', $request->employer_id)
                ->whereNull('deleted_at')
                ->with('employer:user_id,first_name,last_name,username')
                ->latest()
                ->get();

            return response()->json($jobs);
        }

        $jobs = JobPosting::where('status', 'open')
            ->whereNull('deleted_at')
            ->with('employer:user_id,first_name,last_name,username')
            ->latest()
            ->get();

        return response()->json($jobs);
    }

    // Create a job posting
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_title'      => 'required|string|max:150',
            'company_name'   => 'required|string|max:150',
            'company_logo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'location'       => 'nullable|string|max:255',
            'job_type'       => 'required|in:full-time,part-time,contract,internship,temporary',
            'description'    => 'required|string',
            'requirements'   => 'nullable|string',
            'salary_range'   => 'nullable|string|max:100',
            'contact_email'  => 'nullable|email|max:150',
            'contact_number' => 'nullable|string|max:55',
            'status'         => 'nullable|in:open,closed',
            'deadline'       => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $logoPath = null;
        if ($request->hasFile('company_logo')) {
            $logoPath = $request->file('company_logo')->store('job_logos', 'public');
        }

        $job = JobPosting::create([
            'employer_id'    => $request->user()->user_id,
            'job_title'      => $request->job_title,
            'company_name'   => $request->company_name,
            'company_logo'   => $logoPath ? url('storage/' . $logoPath) : null, // ✅ FIXED: asset() → url()
            'location'       => $request->location,
            'job_type'       => $request->job_type,
            'description'    => $request->description,
            'requirements'   => $request->requirements,
            'salary_range'   => $request->salary_range,
            'contact_email'  => $request->contact_email,
            'contact_number' => $request->contact_number,
            'status'         => $request->status ?? 'open',
            'deadline'       => $request->deadline,
        ]);

        return response()->json([
            'message' => 'Job posted successfully',
            'job'     => $job,
        ], 201);
    }

    // Show a single job
    public function show($job_id)
    {
        $job = JobPosting::with('employer:user_id,first_name,last_name,username')
            ->find($job_id);

        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        return response()->json($job);
    }

    // Update a job posting (employer only — owner check)
    public function update(Request $request, $job_id)
    {
        $job = JobPosting::find($job_id);

        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        if ($job->employer_id !== $request->user()->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'job_title'      => 'sometimes|string|max:150',
            'company_name'   => 'sometimes|string|max:150',
            'company_logo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'location'       => 'nullable|string|max:255',
            'job_type'       => 'sometimes|in:full-time,part-time,contract,internship,temporary',
            'description'    => 'sometimes|string',
            'requirements'   => 'nullable|string',
            'salary_range'   => 'nullable|string|max:100',
            'contact_email'  => 'nullable|email|max:150',
            'contact_number' => 'nullable|string|max:55',
            'status'         => 'nullable|in:open,closed',
            'deadline'       => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('company_logo')) {
            // Delete old local file if exists
            if ($job->company_logo) {
                $oldPath = str_replace(url('storage/'), '', $job->company_logo); // ✅ FIXED: asset() → url()
                Storage::disk('public')->delete($oldPath);
            }

            $logoPath = $request->file('company_logo')->store('job_logos', 'public');
            $job->company_logo = url('storage/' . $logoPath); // ✅ FIXED: asset() → url()
        }

        $job->update($request->only([
            'job_title', 'company_name', 'location', 'job_type',
            'description', 'requirements', 'salary_range',
            'contact_email', 'contact_number', 'status', 'deadline',
        ]));

        $job->save();

        return response()->json([
            'message' => 'Job updated successfully',
            'job'     => $job,
        ]);
    }

    // Soft delete a job posting
    public function destroy(Request $request, $job_id)
    {
        $job = JobPosting::find($job_id);

        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        if ($job->employer_id !== $request->user()->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($job->company_logo) {
            $oldPath = str_replace(url('storage/'), '', $job->company_logo); // ✅ FIXED: asset() → url()
            Storage::disk('public')->delete($oldPath);
        }

        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }
}