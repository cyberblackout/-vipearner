<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'string', 'max:50'],
            'reward' => ['required', 'numeric', 'min:0'],
            'daily_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Task title is required.',
            'type.required' => 'Task type is required.',
            'reward.required' => 'Task reward is required.',
            'reward.numeric' => 'Reward must be a valid number.',
            'reward.min' => 'Reward cannot be negative.',
        ];
    }
}
