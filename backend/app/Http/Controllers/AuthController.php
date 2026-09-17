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
     * Legacy link-based verification email — no longer called by register(),
     * kept in case anything else still references it.
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

    /**
     * Asks the Apps Script relay to confirm a registration OTP token is
     * genuine and unexpired. The relay owns the HMAC secret used to sign
     * the token (issued by its verifyOtp action) — Laravel never needs to
     * know that secret, it just asks the relay to check.
     *
     * Fails CLOSED (returns false) on any relay error — unlike the email
     * send, a broken check here must never let an unverified email through.
     */
    private function verifyRegistrationOtp(string $email, string $token): bool
    {
        try {
            $response = Http::timeout(10)->post(env('RELAY_URL'), [
                'secret' => env('RELAY_SECRET'),
                'action' => 'verifyRegistrationToken',
                'email'  => $email,
                'token'  => $token,
            ]);

            $data = $response->json();

            return (bool) ($data['success'] ?? false) && (bool) ($data['valid'] ?? false);
        } catch (\Throwable $e) {
            Log::error('Registration OTP verification relay failed: ' . $e->getMessage());
            return false;
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

        // Block unverified users (admins bypass this). Should no longer be
        // reachable for new registrations since register() now requires a
        // verified OTP token before the account is even created — kept as
        // a safety net for any pre-existing unverified accounts.
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
            'first_name'         => 'nullable|string|max:55',
            'middle_name'        => 'nullable|string|max:55',
            'last_name'          => 'nullable|string|max:55',
            'age'                => 'required|string|max:3',
            'address'            => 'nullable|string|max:255',
            'contact_number'     => 'nullable|string|max:55|unique:users,contact_number',
            'username'           => 'required|string|max:55|unique:users,username',
            'section'            => 'nullable|string|max:55',
            'school'             => 'nullable|string|max:255',
            'email'              => 'required|email|unique:users,email',
            'password'           => 'required|string',
            'role'               => 'nullable|in:applicant,employer,admin',
            'verificationToken'  => 'required|string',
        ]);

        // Email OTP must have already been verified via the relay's
        // sendOtp/verifyOtp actions (called directly from Register.tsx).
        // This confirms that token before ever touching the database.
        if (!$this->verifyRegistrationOtp($request->email, $request->verificationToken)) {
            throw ValidationException::withMessages([
                'email' => ['Your email verification has expired or is invalid. Please verify your email again.'],
            ]);
        }

        $username = strtolower($request->username);

        $user = User::create([
            'first_name'        => $request->first_name,
            'middle_name'       => $request->middle_name,
            'last_name'         => $request->last_name,
            'age'               => $request->age,
            'address'           => $request->address,
            'contact_number'    => $request->contact_number,
            'username'          => $username,
            'section'           => $request->section,
            'school'            => $request->school,
            'email'             => $request->email,
            'password'          => Hash::make($request->password),
            'role'              => $request->role ?? 'applicant',
            'email_verified_at' => now(), // OTP already proved this — account is verified on creation
        ]);

        return response()->json([
            'message' => 'Registration successful. You can now log in.',
        ], 201);
    }

    public function resendVerification(Request $request)
    {
        // Legacy link-based resend — no longer reachable from the new OTP
        // flow (unverified accounts are never created now), kept only for
        // any pre-existing unverified users.
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