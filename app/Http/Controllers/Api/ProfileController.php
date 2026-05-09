<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load('vipLevel');
        return response()->json($user);
    }

    public function update(Request $request)
    {
        $request->validate([
            'display_name' => 'nullable|string|max:80',
        ]);

        $request->user()->update($request->only(['display_name']));

        return response()->json($request->user()->fresh());
    }
}