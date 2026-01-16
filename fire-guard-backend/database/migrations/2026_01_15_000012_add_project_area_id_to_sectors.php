<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sectors', function (Blueprint $table) {
            $table->foreignId('project_area_id')
                ->nullable()
                ->after('sector_id')
                ->constrained('project_areas')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sectors', function (Blueprint $table) {
            $table->dropForeign(['project_area_id']);
            $table->dropColumn('project_area_id');
        });
    }
};

