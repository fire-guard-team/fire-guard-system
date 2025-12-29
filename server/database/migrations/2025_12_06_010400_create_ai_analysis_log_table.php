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
        Schema::create('ai_analysis_log', function (Blueprint $table) {
            $table->id('analysis_id');
            $table->unsignedBigInteger('sensor_id')->nullable();
            $table->unsignedBigInteger('sector_id')->nullable();
            $table->string('algorithm_name')->nullable();
            $table->json('input_data')->nullable();
            $table->decimal('risk_result', 5, 2)->nullable();
            $table->string('decision')->nullable(); // fire, no_fire, suspicious
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->foreign('sensor_id')->references('sensor_id')->on('sensors')->onDelete('set null');
            $table->foreign('sector_id')->references('sector_id')->on('sectors')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_analysis_log');
    }
};
