<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Announcement title is required.',
            'content.required' => 'Announcement content is required.',
            'ends_at.after' => 'End date must be after start date.',
        ];
    }
}
