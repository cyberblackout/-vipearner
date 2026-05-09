<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 255)->default('Engagement Task');
            $table->text('description')->nullable();
            $table->text('facebook_url');
            $table->decimal('reward', 8, 2);
            $table->integer('wait_seconds')->default(15);
            $table->boolean('is_active')->default(true);
            $table->integer('min_vip_sort')->default(0);
            $table->integer('display_order')->default(0);
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};