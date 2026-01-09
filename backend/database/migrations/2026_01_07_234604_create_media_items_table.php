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
        Schema::create('media_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('mal_id')->nullable();
            $table->string('title');
            $table->string('title_original')->nullable();
            $table->string('source_url')->nullable();
            $table->string('type'); // anime, manga
            $table->string('cover_image')->nullable();
            $table->string('cover_image_large')->nullable();
            $table->string('banner_image')->nullable();
            $table->string('status');
            $table->decimal('score', 3, 1)->default(0);
            $table->integer('current_episode')->default(0);
            $table->integer('total_episodes')->default(0);
            $table->integer('current_chapter')->default(0);
            $table->integer('total_chapters')->default(0);
            $table->integer('current_volume')->default(0);
            $table->integer('total_volumes')->default(0);
            $table->text('synopsis')->nullable();
            $table->text('review')->nullable();
            $table->json('genres')->nullable(); // stored as JSON array
            $table->json('tags')->nullable();
            $table->string('studio')->nullable();
            $table->string('author')->nullable();
            $table->integer('release_year')->nullable();
            $table->string('season')->nullable();
            $table->string('age_rating')->nullable();
            $table->string('trailer_url')->nullable();
            $table->string('opening_url')->nullable();
            $table->string('ending_url')->nullable();
            $table->string('broadcast_day')->nullable();
            $table->json('related_media')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('rewatch_count')->default(0);
            $table->boolean('is_favorite')->default(false);
            $table->text('notes')->nullable();
            $table->json('streaming_services')->nullable();
            $table->json('user_streaming')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_items');
    }
};
