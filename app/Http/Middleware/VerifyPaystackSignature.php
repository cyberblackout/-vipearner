<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class VerifyPaystackSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->header('x-paystack-signature');

        if (!$signature) {
            Log::warning('Paystack webhook: missing signature');
            abort(401, 'Missing signature');
        }

        $secret = config('paystack.webhook_secret');
        $payload = $request->getContent();

        $expectedSignature = hash_hmac('sha512', $payload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Paystack webhook: invalid signature');
            abort(401, 'Invalid signature');
        }

        return $next($request);
    }
}