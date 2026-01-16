<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('role', 'admin')->first();
        $operatorRole = Role::where('role', 'operator')->first();
        $analystRole = Role::where('role', 'analyst')->first();

        // Admin user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@fireguard.com',
            'password' => Hash::make('admin123'),
            'role_id' => $adminRole->id,
            'status' => 'active',
        ]);

        // Update existing users instead of creating new ones
        $existingAnalyst = User::where('email', 'researcher@fireguard.com')->first();
        if ($existingAnalyst) {
            $existingAnalyst->update([
                'name' => 'Environmental Analyst',
                'email' => 'analyst@fireguard.com',
                'password' => Hash::make('analyst123'),
                'role_id' => $analystRole->id,
                'status' => 'active',
            ]);
        }

        $existingOperator = User::where('email', 'supervisor@fireguard.com')->first();
        if ($existingOperator) {
            $existingOperator->update([
                'name' => 'Control Room Operator',
                'email' => 'operator@fireguard.com',
                'password' => Hash::make('operator123'),
                'role_id' => $operatorRole->id,
                'status' => 'active',
            ]);
        }

        // Inactive user for testing
        User::create([
            'name' => 'Inactive User',
            'email' => 'inactive@fireguard.com',
            'password' => Hash::make('inactive123'),
            'role_id' => $adminRole->id,
            'status' => 'inactive',
        ]);
    }
}
