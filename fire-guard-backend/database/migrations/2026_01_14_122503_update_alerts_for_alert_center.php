<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('alerts', function (Blueprint $table) {

            // نوع التنبيه (Smoke, Temperature, Humidity...)
            $table->string('alert_type')->nullable()->after('alert_level');

            // Trigger conditions (JSON)
            $table->json('meta')->nullable()->after('alert_type');

            // من قام بتأكيد التنبيه
            $table->foreignId('acknowledged_by')
                ->nullable()
                ->after('acknowledged_at')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alerts', function (Blueprint $table) {
            $table->dropColumn(['alert_type', 'meta', 'acknowledged_by']);
        });
    }
};
