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
        Schema::create('wildfire_events', function (Blueprint $table) {
            $table->id('event_id');

            $table->unsignedBigInteger('sector_id')->nullable();

            $table->timestamp('detected_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            $table->string('status');        // Active, Controlled, Closed
            $table->string('spread_level');  // Low, Medium, High

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wildfire_events');
    }
};
