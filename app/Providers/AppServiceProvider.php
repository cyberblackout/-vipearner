<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production (required for cPanel reverse proxy)
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Trust all proxies (cPanel shared hosting uses reverse proxies)
        Request::setTrustedProxies(
            ['127.0.0.1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
            Request::HEADER_X_FORWARDED_FOR |
            Request::HEADER_X_FORWARDED_HOST |
            Request::HEADER_X_FORWARDED_PORT |
            Request::HEADER_X_FORWARDED_PROTO
        );

        // Security headers on every response
        $this->app['router']->pushMiddlewareToGroup('web', \App\Http\Middleware\SecurityHeaders::class);
        $this->app['router']->pushMiddlewareToGroup('api', \App\Http\Middleware\SecurityHeaders::class);
    }
}
