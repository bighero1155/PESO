<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Sends the "verify your email" link via the Apps Script relay instead
     * of Laravel's SMTP mailer — Render blocks outbound SMTP ports, but a
     * plain HTTPS POST (port 443) to Apps Script is unaffected, and the
     * script sends the actual email through GmailApp.
     *
     * Used by both register() and resendVerification() so the link-building
     * and relay-call logic isn't duplicated.
     *
     * Failures here are logged but never thrown — a relay outage should
     * never break registration itself. The user's "Resend" button in the
     * frontend covers the case where the email never arrived.
     */
    private function sendVerificationEmailViaRelay(User $user): void
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->user_id, 'hash' => sha1($user->email)]
        );

        try {
            Http::timeout(10)->post(env('RELAY_URL'), [
                'secret' => env('RELAY_SECRET'),
                'action' => 'sendVerification',
                'email'  => $user->email,
                'name'   => $user->first_name,
                'link'   => $verificationUrl,
            ]);
        } catch (\Throwable $e) {
            Log::error('Verification email relay failed: ' . $e->getMessage());
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password'   => 'required|string',
        ]);

        $field = filter_var($request->identifier, FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'username';

        $identifier = $field === 'username'
            ? strtolower($request->identifier)
            : $request->identifier;

        $user = User::where($field, $identifier)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Block unverified users (admins bypass this)
        if ($user->role !== 'admin' && is_null($user->email_verified_at)) {
            return response()->json([
                'message'    => 'Please verify your email before logging in. Check your inbox.',
                'unverified' => true,
                'email'      => $user->email,
            ], 403);
        }

        $user->update(['last_login_at' => now()]);

        return response()->json([
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user'  => $user,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name'     => 'nullable|string|max:55',
            'middle_name'    => 'nullable|string|max:55',
            'last_name'      => 'nullable|string|max:55',
            'age'            => 'required|string|max:3',
            'address'        => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:55|unique:users,contact_number',
            'username'       => 'required|string|max:55|unique:users,username',
            'section'        => 'nullable|string|max:55',
            'school'         => 'nullable|string|max:255',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string',
            'role'           => 'nullable|in:applicant,employer,admin',
        ]);

        $username = strtolower($request->username);

        $user = User::create([
            'first_name'     => $request->first_name,
            'middle_name'    => $request->middle_name,
            'last_name'      => $request->last_name,
            'age'            => $request->age,
            'address'        => $request->address,
            'contact_number' => $request->contact_number,
            'username'       => $username,
            'section'        => $request->section,
            'school'         => $request->school,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'role'           => $request->role ?? 'applicant',
        ]);

        // Send verification email via the Apps Script relay (not SMTP —
        // see sendVerificationEmailViaRelay() docblock for why).
        $this->sendVerificationEmailViaRelay($user);

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
        ], 201);
    }

    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.'], 400);
        }

        $this->sendVerificationEmailViaRelay($user);

        return response()->json(['message' => 'Verification email resent successfully.']);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->email))) {
            return redirect(env('FRONTEND_URL') . '/verify-email/error');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect(env('FRONTEND_URL') . '/verify-email/already-verified');
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return redirect(env('FRONTEND_URL') . '/verify-email/success');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}