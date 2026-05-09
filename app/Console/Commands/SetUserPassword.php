<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetUserPassword extends Command
{
    protected $signature = 'user:set-password {phone : Phone number} {password : Password}';

    protected $description = 'Set user password';

    public function handle()
    {
        $phone = $this->argument('phone');
        $password = $this->argument('password');

        $phone = $this->normalizePhone($phone);

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            $this->error('User not found!');
            return 1;
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info("Password set for {$phone}");
        return 0;
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '233')) {
            return '+' . $phone;
        }
        if (str_starts_with($phone, '0')) {
            return '+233' . substr($phone, 1);
        }
        return '+' . $phone;
    }
}