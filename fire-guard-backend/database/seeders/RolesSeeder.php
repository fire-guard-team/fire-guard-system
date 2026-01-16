<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['role' => 'admin', 'name' => 'Administrator'],
            ['role' => 'operator', 'name' => 'Control Room Operator'],
            ['role' => 'analyst', 'name' => 'Environmental Analyst'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['role' => $role['role']], // شرط البحث
                [
                    'name' => $role['name'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
