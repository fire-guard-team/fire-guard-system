<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'view_dashboard', 'description' => 'View dashboard'],
            ['name' => 'view_interactive_map', 'description' => 'View interactive map'],
            ['name' => 'view_alerts_center', 'description' => 'View alerts center'],
            ['name' => 'view_sensor_management', 'description' => 'View sensor management'],
            ['name' => 'view_forest_sectors', 'description' => 'View forest sectors'],
            ['name' => 'view_reports_analytics', 'description' => 'View reports and analytics'],
            ['name' => 'manage_users', 'description' => 'Manage users'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        $adminRole = Role::where('role', 'admin')->first();
        $operatorRole = Role::where('role', 'operator')->first();
        $analystRole = Role::where('role', 'analyst')->first();

        if (!$adminRole) {
            $adminRole = Role::create(['role' => 'admin', 'name' => 'Administrator']);
        }
        if (!$operatorRole) {
            $operatorRole = Role::create(['role' => 'operator', 'name' => 'Control Room Operator']);
        }
        if (!$analystRole) {
            $analystRole = Role::create(['role' => 'analyst', 'name' => 'Environmental Analyst']);
        }

        $allPermissions = Permission::all();

        // Admin gets all permissions
        $adminRole->permissions()->attach($allPermissions->pluck('id'));

        // Analyst (Environmental Analyst) gets limited permissions - mainly reports and analytics
        $analystPermissions = Permission::whereIn('name', [
            'view_dashboard',
            'view_reports_analytics'
        ])->get();
        $analystRole->permissions()->attach($analystPermissions->pluck('id'));

        // Operator (Control Room Operator) gets most permissions except managing users
        $operatorPermissions = Permission::whereNotIn('name', [
            'manage_users'
        ])->get();
        $operatorRole->permissions()->attach($operatorPermissions->pluck('id'));
    }
}
