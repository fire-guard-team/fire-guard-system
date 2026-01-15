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
        Schema::create('gateway_heartbeats', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('gateway_id');
            $table->integer('received_sensors')->default(0);
            $table->integer('failed_sensors')->default(0);

            $table->string('network_quality')->nullable(); // good | weak | poor
            $table->timestamp('received_at');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateway_heartbeats');
    }
};
