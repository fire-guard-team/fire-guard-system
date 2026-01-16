<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clear existing role permissions
        DB::table('role_permissions')->delete();

        $adminRole = Role::where('role', 'admin')->first();
        $operatorRole = Role::where('role', 'operator')->first();
        $analystRole = Role::where('role', 'analyst')->first();

        if ($adminRole && $operatorRole && $analystRole) {
            $allPermissions = Permission::all();

            // Admin gets all permissions
            $adminRole->permissions()->attach($allPermissions->pluck('id'));

            // Analyst gets limited permissions - mainly reports and analytics
            $analystPermissions = Permission::whereIn('name', [
                'view_dashboard',
                'view_reports_analytics'
            ])->get();
            $analystRole->permissions()->attach($analystPermissions->pluck('id'));

            // Operator gets most permissions except managing users
            $operatorPermissions = Permission::whereNotIn('name', [
                'manage_users'
            ])->get();
            $operatorRole->permissions()->attach($operatorPermissions->pluck('id'));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear role permissions
        DB::table('role_permissions')->delete();
    }
};
