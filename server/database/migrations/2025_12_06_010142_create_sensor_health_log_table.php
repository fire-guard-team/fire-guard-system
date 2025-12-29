<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sensor_health_log', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('sensor_id');
            $table->integer('battery_level')->nullable(); // 0–100
            $table->decimal('voltage', 6, 3)->nullable();
            $table->integer('signal_strength')->nullable(); // RSSI
            $table->string('error_code')->nullable();       // optional error message
            $table->timestampTz('logged_at')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->foreign('sensor_id')->references('sensor_id')->on('sensors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_health_log');
    }
};
