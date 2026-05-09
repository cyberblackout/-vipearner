<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'phone', 'password', 'display_name', 'avatar_url',
        'balance', 'total_income', 'daily_revenue', 'monthly_revenue',
        'total_profit', 'total_withdrawals', 'work_deposit',
        'vip_level', 'vip_upgraded_at',
        'referral_code', 'referred_by',
        'last_checkin', 'checkin_streak', 'last_lucky_bag',
        'ban_reason',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'total_income' => 'decimal:2',
        'daily_revenue' => 'decimal:2',
        'monthly_revenue' => 'decimal:2',
        'total_profit' => 'decimal:2',
        'total_withdrawals' => 'decimal:2',
        'work_deposit' => 'decimal:2',
        'vip_upgraded_at' => 'datetime',
        'last_checkin' => 'date',
        'last_lucky_bag' => 'datetime',
        'is_admin' => 'boolean',
        'is_banned' => 'boolean',
    ];

    protected $hidden = [
        'password', 'ban_reason',
    ];

    public function vipLevel(): BelongsTo
    {
        return $this->belongsTo(VipLevel::class, 'vip_level', 'name');
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by', 'id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id', 'id');
    }

    public function referralsMade(): HasMany
    {
        return $this->hasMany(Referral::class, 'referred_id', 'id');
    }

    public function taskLogs(): HasMany
    {
        return $this->hasMany(TaskLog::class, 'user_id', 'id');
    }

    public function taskSessions(): HasMany
    {
        return $this->hasMany(TaskSession::class, 'user_id', 'id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'user_id', 'id');
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class, 'user_id', 'id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(\App\Models\Notification::class, 'user_id', 'id');
    }

    public function pendingWithdrawal()
    {
        return $this->withdrawals()->where('status', 'pending');
    }

    public function getTodayTaskCountAttribute(): int
    {
        return $this->taskLogs()
            ->whereDate('completed_at', now()->timezone('Africa/Accra')->toDateString())
            ->count();
    }

    public function getVipSortOrderAttribute(): int
    {
        return $this->vipLevel?->sort_order ?? 0;
    }

    public static function generateReferralCode(): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 8));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }
}