<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'string', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'type' => ['nullable', 'string', 'max:50'],
            'is_read' => ['nullable', 'boolean'],
            'data' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User ID is required.',
            'user_id.exists' => 'User not found.',
            'title.required' => 'Notification title is required.',
            'message.required' => 'Notification message is required.',
        ];
    }
}
