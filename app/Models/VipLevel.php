<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VipLevel extends Model
{
    protected $primaryKey = 'name';
    public $incrementing = false;

    protected $fillable = [
        'name', 'sort_order', 'daily_tasks', 'reward_per_task', 'upgrade_cost', 'color_hex',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'daily_tasks' => 'integer',
        'reward_per_task' => 'decimal:2',
        'upgrade_cost' => 'decimal:2',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'vip_level', 'name');
    }

    public function getNextLevel(): ?self
    {
        return static::where('sort_order', $this->sort_order + 1)->first();
    }

    public function canUpgrade(?float $balance): bool
    {
        return $this->upgrade_cost !== null && $balance >= $this->upgrade_cost;
    }
}