<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wildfire_events', function (Blueprint $table) {
            $table->unsignedBigInteger('sensor_id')->nullable()->after('event_id');
            $table->json('meta')->nullable()->after('notes'); // للبيانات الإضافية
        });
    }

    public function down(): void
    {
        Schema::table('wildfire_events', function (Blueprint $table) {
            $table->dropColumn(['sensor_id', 'meta']);
        });
    }
};