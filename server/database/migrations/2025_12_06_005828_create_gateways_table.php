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
        Schema::create('gateways', function (Blueprint $table) {
            $table->id('gateway_id');
            $table->string('name');
            $table->string('device_id'); // MAC or serial
            $table->unsignedBigInteger('sector_id');
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->timestampTz('last_online')->nullable();
            $table->string('status')->default('active'); // active, offline, faulty
            $table->timestampsTz();

            $table->foreign('sector_id')->references('sector_id')->on('sectors');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateways');
    }
};
