<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->decimal('amount', 12, 2);
            $table->enum('direction', ['+', '-']);
            $table->enum('type', ['deposit', 'withdrawal', 'task_reward', 'vip_upgrade', 'lucky_bag', 'daily_checkin', 'referral_bonus', 'admin_adjustment']);
            $table->enum('status', ['pending', 'success', 'failed', 'reversed'])->default('pending');
            $table->string('paystack_reference', 100)->unique()->nullable();
            $table->json('metadata')->nullable();
            $table->uuid('admin_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('users');

            // Performance indexes for admin dashboard and user history queries
            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};