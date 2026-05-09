<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskSession extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'user_id', 'task_id', 'started_at', 'tab_active_seconds', 'completed', 'expires_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'tab_active_seconds' => 'integer',
        'completed' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id', 'id');
    }

    public function taskLog()
    {
        return $this->hasOne(TaskLog::class, 'session_id', 'id');
    }

    public function isExpired(): bool
    {
        return now()->gte($this->expires_at);
    }

    public function getElapsedSeconds(): int
    {
        return now()->diffInSeconds($this->started_at);
    }
}