<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;

/*
|--------------------------------------------------------------------------
| Frontend (SPA shell) routes — serve Blade views; JS handles auth state
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index']);
Route::get('/auth', [HomeController::class, 'index']);
Route::get('/register', [HomeController::class, 'register']);
Route::get('/login', [HomeController::class, 'index']);
Route::get('/tasks', [HomeController::class, 'tasks']);
Route::get('/vip', [HomeController::class, 'vip']);
Route::get('/mine', [HomeController::class, 'mine']);
Route::get('/messages', [HomeController::class, 'messages']);

/*
|--------------------------------------------------------------------------
| Admin panel — token-authenticated via JS; view itself is public but all
| data is gated behind the admin API routes (auth:sanctum + admin middleware)
|--------------------------------------------------------------------------
*/
Route::get('/admin', function () {
    return view('admin');
});