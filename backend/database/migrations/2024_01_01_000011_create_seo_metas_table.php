<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_metas', function (Blueprint $table) {
            $table->id();
            $table->string('metaable_type'); // Product, Category, Page, Blog, Event
            $table->unsignedBigInteger('metaable_id');
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamps();
            
            $table->index(['metaable_type', 'metaable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_metas');
    }
};

