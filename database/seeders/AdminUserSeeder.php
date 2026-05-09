<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Password is read from environment variable — set ADMIN_PASSWORD in .env
        // Falls back to a strong default if not set (change immediately after first deploy)
        $password = env('ADMIN_PASSWORD', 'ChangeMe@2025!');

        User::updateOrCreate(
            ['phone' => '+233000000001'],
            [
                'id'                => 'a0000000-0000-0000-0000-000000000001',
                'password'          => Hash::make($password),
                'display_name'      => 'Super Admin',
                'avatar_url'        => null,
                'balance'           => 0,
                'total_income'      => 0,
                'daily_revenue'     => 0,
                'monthly_revenue'   => 0,
                'total_profit'      => 0,
                'total_withdrawals' => 0,
                'work_deposit'      => 0,
                'vip_level'         => 'Intern',
                'referral_code'     => 'ADMN0001',
                'is_admin'          => true,
                'is_banned'         => false,
            ]
        );
    }
}