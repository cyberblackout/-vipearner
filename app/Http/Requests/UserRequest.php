<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;
        $isCreating = !$userId;

        return [
            'phone' => ['required', 'string', 'max:20', $isCreating ? 'unique:users,phone' : 'unique:users,phone,' . $userId],
            'password' => $isCreating ? ['required', 'string', 'min:6', 'confirmed'] : ['nullable', 'string', 'min:6'],
            'display_name' => ['required', 'string', 'max:100'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'balance' => ['nullable', 'numeric', 'min:0'],
            'vip_level' => ['nullable', 'string', 'max:50'],
            'referral_code' => ['nullable', 'string', 'max:20'],
            'referred_by' => ['nullable', 'string', 'max:100'],
            'is_admin' => ['nullable', 'boolean'],
            'is_banned' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Phone number is required.',
            'phone.unique' => 'This phone number is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 6 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'display_name.required' => 'Display name is required.',
        ];
    }
}
