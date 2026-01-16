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

            // ❗ لا نضيف sector_id لأنه موجود مسبقًا

            $table->decimal('lat', 10, 7)
                ->nullable()
                ->after('sector_id');

            $table->decimal('lng', 10, 7)
                ->nullable()
                ->after('lat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sensors', function (Blueprint $table) {
            $table->dropColumn(['lat', 'lng']);
        });
    }
};
