<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VipLevelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'display_name' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'daily_task_limit' => ['required', 'integer', 'min:1'],
            'task_reward_multiplier' => ['required', 'numeric', 'min:1'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'VIP level name is required.',
            'display_name.required' => 'Display name is required.',
            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'daily_task_limit.required' => 'Daily task limit is required.',
            'task_reward_multiplier.required' => 'Task reward multiplier is required.',
        ];
    }
}
