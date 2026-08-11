<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobApplication extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'application_id';

    protected $fillable = [
        'job_id',
        'applicant_id',
        'cover_letter',
        'resume_url',
        'status',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function job()
    {
        return $this->belongsTo(JobPosting::class, 'job_id', 'job_id');
    }

    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_id', 'user_id');
    }
}