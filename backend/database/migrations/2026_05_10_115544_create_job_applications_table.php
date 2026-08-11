<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id('application_id');
            $table->unsignedBigInteger('job_id');
            $table->unsignedBigInteger('applicant_id');
            $table->text('cover_letter')->nullable();
            $table->string('resume_url', 500)->nullable();
            $table->enum('status', ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'])->default('pending');
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('job_id')->references('job_id')->on('job_postings')->onDelete('cascade');
            $table->foreign('applicant_id')->references('user_id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index(['job_id', 'applicant_id']);
            $table->index('applicant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};