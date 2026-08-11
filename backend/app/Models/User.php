<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $primaryKey = 'user_id';

    protected $hidden = [
        'password',
    ];

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'age',
        'address',
        'contact_number',
        'username',
        'section',
        'email',
        'password',
        'role',
        'coins',
        'total_score',
        'avatar',
        'rank',
        'last_login_at',
        'school',
    ];

    public function sendEmailVerificationNotification(): void
{
    $this->notify(new \App\Notifications\VerifyEmailNotification());
}

    protected $dates = ['deleted_at'];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}