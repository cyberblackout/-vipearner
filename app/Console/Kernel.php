<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            \App\Models\User::query()->update(['daily_revenue' => 0]);
        })->dailyAt('00:00')->timezone('Africa/Accra');

        $schedule->call(function () {
            \App\Models\User::query()->update(['monthly_revenue' => 0]);
        })->monthlyOn(1, '00:00')->timezone('Africa/Accra');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}