<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('task_id');
            $table->timestamp('started_at')->useCurrent();
            $table->integer('tab_active_seconds')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');

            $table->index(['user_id', 'completed', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_sessions');
    }
};