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
        Schema::create('sectors', function (Blueprint $table) {
            $table->id('sector_id');
            $table->string('sector_name');
            $table->double('center_lat')->nullable();
            $table->double('center_lng')->nullable();
            $table->unsignedBigInteger('cluster_id');
            $table->string('status')->default('Safe');
            $table->timestampsTz();

            $table->foreign('cluster_id')->references('cluster_id')->on('clusters')->onDelete('cascade');
        });

        // PostGIS polygon column
        DB::statement('ALTER TABLE sectors ADD COLUMN geo_boundary geometry(POLYGON,4326);');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sectors');
    }
};
