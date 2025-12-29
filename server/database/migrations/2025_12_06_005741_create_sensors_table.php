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
        Schema::create('sensors', function (Blueprint $table) {
            $table->id('sensor_id');
            $table->string('sensor_name')->nullable();
            $table->string('device_id')->unique(); // MAC or Serial
            $table->unsignedBigInteger('type_id');
            $table->unsignedBigInteger('sector_id');
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->integer('battery_level')->nullable();
            $table->string('status')->default('Active'); // Active, Inactive, Faulty
            $table->timestampTz('last_heartbeat')->nullable();
            $table->timestampTz('installation_date')->nullable();
            $table->timestampsTz();

            $table->foreign('type_id')->references('type_id')->on('sensor_types');
            $table->foreign('sector_id')->references('sector_id')->on('sectors');
        });

        // Add PostGIS point
        DB::statement("ALTER TABLE sensors ADD COLUMN geom geometry(POINT,4326);");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensors');
    }
};
