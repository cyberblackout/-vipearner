<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vip_levels', function (Blueprint $table) {
            $table->string('name', 20)->primary();
            $table->integer('sort_order')->unique();
            $table->integer('daily_tasks');
            $table->decimal('reward_per_task', 8, 2);
            $table->decimal('upgrade_cost', 10, 2)->nullable();
            $table->string('color_hex', 7)->default('#2563EB');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vip_levels');
    }
};