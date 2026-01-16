<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update researcher to analyst
        $analystRole = DB::table('roles')->where('role', 'analyst')->first();
        if ($analystRole) {
            DB::table('users')
                ->where('email', 'researcher@fireguard.com')
                ->update(['role_id' => $analystRole->id]);
        }

        // Update supervisor to operator
        $operatorRole = DB::table('roles')->where('role', 'operator')->first();
        if ($operatorRole) {
            DB::table('users')
                ->where('email', 'supervisor@fireguard.com')
                ->update(['role_id' => $operatorRole->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This would be complex to reverse, so we'll leave it empty
    }
};
