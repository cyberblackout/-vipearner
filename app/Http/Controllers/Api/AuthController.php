<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|regex:/^(\+233|0)[0-9]{9}$/',
        ]);

        $phone = $this->normalizePhone($request->phone);

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $cacheKey = "otp:{$phone}";

        // Store only the hash — never cache plaintext OTPs
        Cache::put($cacheKey, ['hash' => Hash::make($code)], now()->addMinutes(10));

        $sender = config('app.termii_sender_id', 'VIPEarner');
        $termiiKey = config('app.termii_api_key');

        if ($termiiKey) {
            try {
                Http::post('https://api.ng.termii.com/api/sms/send', [
                    'api_key' => $termiiKey,
                    'to' => $phone,
                    'from' => $sender,
                    'sms' => "Your VIP Earner OTP: {$code}",
                    'type' => 'plain',
                    'channel' => 'dnd',
                ]);
            } catch (\Exception $e) {
                // Log error but don't fail
            }
        }

        return response()->json(['message' => 'OTP sent']);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|regex:/^(\+233|0)[0-9]{9}$/',
            'code' => 'required|digits:6',
            'ref_code' => 'nullable|string',
        ]);

        $phone = $this->normalizePhone($request->phone);
        $cacheKey = "otp:{$phone}";
        $cached = Cache::get($cacheKey);

        if (!$cached || !Hash::check($request->code, $cached['hash'])) {
            return response()->json(['error' => 'Invalid OTP'], 422);
        }

        Cache::forget($cacheKey);

        $user = User::firstOrCreate(
            ['phone' => $phone],
            [
                'id' => Str::uuid()->toString(),
                'referral_code' => User::generateReferralCode(),
            ]
        );

        if ($request->ref_code && !$user->referred_by) {
            $referrer = User::where('referral_code', $request->ref_code)->first();
            if ($referrer && $referrer->id !== $user->id) {
                $user->update(['referred_by' => $referrer->id]);
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone'    => 'required|string',
            'password' => 'required|string',
        ]);

        // Always normalize — handles +233, 0, and raw 9-digit formats
        $phone = $this->normalizePhone($request->phone);

        $user = User::where('phone', $phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid phone or password'], 422);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'phone' => 'required|regex:/^(\+233|0)[0-9]{9}$/',
            'password' => 'required|min:6',
            'display_name' => 'required|string|max:80',
        ]);

        $phone = $this->normalizePhone($request->phone);

        if (User::where('phone', $phone)->exists()) {
            return response()->json(['error' => 'Phone number already registered'], 422);
        }

        $user = User::create([
            'id' => Str::uuid()->toString(),
            'phone' => $phone,
            'password' => Hash::make($request->password),
            'display_name' => $request->display_name,
            'referral_code' => User::generateReferralCode(),
        ]);

        if ($request->referral_code) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            if ($referrer && $referrer->id !== $user->id) {
                $user->update(['referred_by' => $referrer->id]);
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '233')) {
            return '+' . $phone;
        }

        if (str_starts_with($phone, '0')) {
            return '+233' . substr($phone, 1);
        }

        return '+' . $phone;
    }
}