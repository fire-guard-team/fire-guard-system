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
        Schema::create('gateway_heartbeat', function (Blueprint $table) {
            $table->id('heartbeat_id');
            $table->unsignedBigInteger('gateway_id');
            $table->string('status')->default('alive'); // alive, weak, down
            $table->integer('battery_level')->nullable();
            $table->integer('signal_strength')->nullable();
            $table->timestampTz('logged_at')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->foreign('gateway_id')->references('gateway_id')->on('gateways')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateway_heartbeat');
    }
};
