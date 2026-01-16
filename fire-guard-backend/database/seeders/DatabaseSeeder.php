<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesSeeder::class);

        $adminRole = DB::table('roles')->where('role', 'admin')->value('id');
        $operatorRole = DB::table('roles')->where('role', 'operator')->value('id');
        $analystRole = DB::table('roles')->where('role', 'analyst')->value('id');

        User::create([
            'name' => 'System Admin',
            'email' => 'admin@fireguard.local',
            'password' => Hash::make('admin123'),
            'role_id' => $adminRole,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Control Operator',
            'email' => 'operator@fireguard.local',
            'password' => Hash::make('operator123'),
            'role_id' => $operatorRole,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Environmental Analyst',
            'email' => 'analyst@fireguard.local',
            'password' => Hash::make('analyst123'),
            'role_id' => $analystRole,
            'email_verified_at' => now(),
        ]);
    }
}
