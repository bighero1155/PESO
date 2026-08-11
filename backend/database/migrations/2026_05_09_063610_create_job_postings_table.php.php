<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id('job_id');
            $table->foreignId('employer_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->string('job_title', 150);
            $table->string('company_name', 150);
            $table->string('company_logo')->nullable();
            $table->string('location', 255)->nullable();
            $table->enum('job_type', ['full-time', 'part-time', 'contract', 'internship', 'temporary'])->default('full-time');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->string('salary_range', 100)->nullable();
            $table->string('contact_email', 150)->nullable();
            $table->string('contact_number', 55)->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->date('deadline')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};