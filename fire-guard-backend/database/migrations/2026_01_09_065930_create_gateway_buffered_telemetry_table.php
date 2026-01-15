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
        Schema::create('gateway_buffered_telemetry', function (Blueprint $table) {
            $table->id();
            $table->integer('gateway_id');
            $table->json('payload'); // كامل Payload
            $table->timestamp('received_at');
            $table->boolean('processed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateway_buffered_telemetry');
    }
};
