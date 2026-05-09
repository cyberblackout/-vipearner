<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * Serves the SPA shell views.
 * Authentication state is managed entirely by the frontend JS
 * via Sanctum bearer tokens — NOT by PHP session guards.
 * These routes are intentionally unguarded; all data is
 * protected by the API routes (auth:sanctum middleware).
 */
class HomeController extends Controller
{
    public function index(): View
    {
        return view('home');
    }

    public function register(): View
    {
        return view('register');
    }

    public function tasks(): View
    {
        return view('tasks');
    }

    public function vip(): View
    {
        return view('vip');
    }

    public function mine(): View
    {
        return view('mine');
    }

    public function messages(): View
    {
        return view('messages');
    }
}