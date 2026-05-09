<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('phone', 20)->unique();
            $table->string('display_name', 80)->nullable();
            $table->text('avatar_url')->nullable();
            $table->decimal('balance', 12, 2)->default(0)->unsigned();
            $table->decimal('total_income', 12, 2)->default(0)->unsigned();
            $table->decimal('daily_revenue', 12, 2)->default(0)->unsigned();
            $table->decimal('monthly_revenue', 12, 2)->default(0)->unsigned();
            $table->decimal('total_profit', 12, 2)->default(0)->unsigned();
            $table->decimal('total_withdrawals', 12, 2)->default(0)->unsigned();
            $table->decimal('work_deposit', 12, 2)->default(0)->unsigned();
            $table->string('vip_level', 20)->default('Intern');
            $table->timestamp('vip_upgraded_at')->nullable();
            $table->string('referral_code', 12)->unique();
            $table->uuid('referred_by')->nullable();
            $table->date('last_checkin')->nullable();
            $table->tinyInteger('checkin_streak')->default(0)->unsigned();
            $table->timestamp('last_lucky_bag')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->boolean('is_banned')->default(false);
            $table->text('ban_reason')->nullable();
            $table->timestamps();

            $table->foreign('vip_level')->references('name')->on('vip_levels');
            $table->foreign('referred_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};