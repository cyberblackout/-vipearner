<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VipLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            ['name' => 'Intern', 'sort_order' => 0, 'daily_tasks' => 5, 'reward_per_task' => 0.20, 'upgrade_cost' => null, 'color_hex' => '#64748B'],
            ['name' => 'VIP 1', 'sort_order' => 1, 'daily_tasks' => 10, 'reward_per_task' => 0.50, 'upgrade_cost' => 10.00, 'color_hex' => '#3B82F6'],
            ['name' => 'VIP 2', 'sort_order' => 2, 'daily_tasks' => 20, 'reward_per_task' => 1.00, 'upgrade_cost' => 25.00, 'color_hex' => '#8B5CF6'],
            ['name' => 'VIP 3', 'sort_order' => 3, 'daily_tasks' => 35, 'reward_per_task' => 1.80, 'upgrade_cost' => 50.00, 'color_hex' => '#F59E0B'],
            ['name' => 'VIP 4', 'sort_order' => 4, 'daily_tasks' => 55, 'reward_per_task' => 2.80, 'upgrade_cost' => 100.00, 'color_hex' => '#EF4444'],
            ['name' => 'VIP 5', 'sort_order' => 5, 'daily_tasks' => 80, 'reward_per_task' => 4.00, 'upgrade_cost' => 200.00, 'color_hex' => '#10B981'],
        ];

        foreach ($levels as $level) {
            DB::table('vip_levels')->insert($level);
        }
    }
}