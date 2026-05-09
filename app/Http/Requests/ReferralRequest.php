<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReferralRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'referrer_id' => ['required', 'string', 'exists:users,id'],
            'referred_id' => ['required', 'string', 'exists:users,id', 'different:referrer_id'],
            'reward' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'referrer_id.required' => 'Referrer ID is required.',
            'referrer_id.exists' => 'Referrer not found.',
            'referred_id.required' => 'Referred user ID is required.',
            'referred_id.exists' => 'Referred user not found.',
            'referred_id.different' => 'You cannot refer yourself.',
            'reward.numeric' => 'Reward must be a valid number.',
        ];
    }
}
