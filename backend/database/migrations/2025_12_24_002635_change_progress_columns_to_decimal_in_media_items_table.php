<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('media_items', function (Blueprint $table) {
            $table->decimal('current_episode', 8, 2)->change();
            $table->decimal('total_episodes', 8, 2)->change();
            $table->decimal('current_chapter', 8, 2)->change();
            $table->decimal('total_chapters', 8, 2)->change();
            $table->decimal('current_volume', 8, 2)->change();
            $table->decimal('total_volumes', 8, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media_items', function (Blueprint $table) {
            $table->integer('current_episode')->change();
            $table->integer('total_episodes')->change();
            $table->integer('current_chapter')->change();
            $table->integer('total_chapters')->change();
            $table->integer('current_volume')->change();
            $table->integer('total_volumes')->change();
        });
    }
};
