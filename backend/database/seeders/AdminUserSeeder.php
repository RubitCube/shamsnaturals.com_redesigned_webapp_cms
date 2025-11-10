<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@shamsnaturals.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        $this->command->info('Admin user created!');
        $this->command->info('Email: admin@shamsnaturals.com');
        $this->command->info('Password: admin123');
    }
}

