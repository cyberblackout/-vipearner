<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BanCheck
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_banned) {
            return response()->json([
                'error'  => 'Account suspended',
                'reason' => $user->ban_reason,
            ], 403);
        }

        return $next($request);
    }
}