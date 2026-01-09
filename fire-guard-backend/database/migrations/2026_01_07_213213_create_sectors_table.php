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
        Schema::create('sectors', function (Blueprint $table) {
            $table->id('sector_id');

            $table->string('name');
            $table->string('status')->default('Safe'); // Safe, Warning, Fire

            // لاحقًا للخرائط
            $table->json('boundary')->nullable(); // Polygon (GeoJSON)

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sectors');
    }
};
