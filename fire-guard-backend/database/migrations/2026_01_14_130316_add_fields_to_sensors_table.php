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
        Schema::table('sensors', function (Blueprint $table) {
            Schema::table('sensors', function (Blueprint $table) {

                $table->unsignedBigInteger('sector_id')
                    ->nullable()
                    ->after('sensor_id');

                $table->string('type')
                    ->nullable()
                    ->after('name'); // temp, smoke, multi

                $table->string('status')
                    ->default('active')
                    ->after('type'); // active, offline, faulty

                $table->timestamp('last_seen')
                    ->nullable()
                    ->after('status');

                $table->integer('battery_level')
                    ->nullable()
                    ->after('last_seen');

                // (اختياري – لكن احترافي)
                $table->foreign('sector_id')
                    ->references('sector_id')
                    ->on('sectors')
                    ->nullOnDelete();
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sensors', function (Blueprint $table) {
            $table->dropForeign(['sector_id']);
            $table->dropColumn([
                'sector_id',
                'type',
                'status',
                'last_seen',
                'battery_level'
            ]);
        });
    }
};
