<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'referrer_id', 'referred_id', 'reward_amount', 'reward_paid', 'paid_at',
    ];

    protected $casts = [
        'reward_amount' => 'decimal:2',
        'reward_paid' => 'boolean',
        'paid_at' => 'datetime',
    ];

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id', 'id');
    }

    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_id', 'id');
    }
}