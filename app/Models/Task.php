<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'title', 'description', 'facebook_url', 'reward',
        'wait_seconds', 'is_active', 'min_vip_sort', 'display_order', 'created_by',
    ];

    protected $casts = [
        'reward' => 'decimal:2',
        'wait_seconds' => 'integer',
        'min_vip_sort' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function taskLogs()
    {
        return $this->hasMany(TaskLog::class, 'task_id', 'id');
    }

    public function taskSessions()
    {
        return $this->hasMany(TaskSession::class, 'task_id', 'id');
    }
}