<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Auth\Factory as Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateSession
{
    protected $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $this->authenticate([$this->getGuard($request)]);

        return $next($request);
    }

    protected function getGuard(Request $request): string
    {
        return $request->is('api/*') ? 'api' : 'web';
    }

    protected function authenticate(array $guards): void
    {
        foreach ($guards as $guard) {
            if ($this->auth->guard($guard)->check()) {
                $this->auth->shouldUse($guard);
                return;
            }
        }

        $this->unauthenticated($guards);
    }

    protected function unauthenticated(array $guards): void
    {
        throw new AuthenticationException(
            'Unauthenticated.',
            $guards,
            null
        );
    }
}