<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPosting extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'job_id';

    protected $fillable = [
        'employer_id',
        'job_title',
        'company_name',
        'company_logo',
        'location',
        'job_type',
        'description',
        'requirements',
        'salary_range',
        'contact_email',
        'contact_number',
        'status',
        'deadline',
    ];

    public function employer()
    {
        return $this->belongsTo(User::class, 'employer_id', 'user_id');
    }
}