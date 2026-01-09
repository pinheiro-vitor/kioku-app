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
        Schema::create('media_list_items', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('custom_list_id')->constrained('custom_lists')->onDelete('cascade');
            $table->foreignUuid('media_item_id')->constrained('media_items')->onDelete('cascade');
            $table->timestamps();

            // Prevent duplicate entries of same item in same list
            $table->unique(['custom_list_id', 'media_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_list_items');
    }
};
