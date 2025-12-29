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
        Schema::create('environmental_data', function (Blueprint $table) {
            $table->id('data_id');
            $table->unsignedBigInteger('sensor_id');
            $table->decimal('temperature', 6, 2)->nullable();
            $table->decimal('humidity', 5, 2)->nullable();
            $table->decimal('smoke_level', 8, 4)->nullable();
            $table->decimal('aqi', 8, 2)->nullable();
            $table->decimal('fire_risk_score', 5, 2)->nullable();
            $table->timestampTz('recorded_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampsTz();

            $table->foreign('sensor_id')->references('sensor_id')->on('sensors')->onDelete('cascade');
        });

        // PostGIS point for environmental data
        DB::statement("ALTER TABLE environmental_data ADD COLUMN geom geometry(POINT,4326);");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('environmental_data');
    }
};
