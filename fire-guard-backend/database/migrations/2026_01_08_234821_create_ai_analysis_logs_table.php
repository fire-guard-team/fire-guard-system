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
        Schema::create('ai_analysis_logs', function (Blueprint $table) {
            $table->id('analysis_id');

            $table->unsignedBigInteger('sensor_id')->nullable();
            $table->unsignedBigInteger('sector_id')->nullable();

            $table->string('algorithm_name')->default('rule_based_v1');

            $table->json('input_data');
            $table->float('risk_score');

            $table->string('decision'); // fire | warning | safe

            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_analysis_logs');
    }
};
