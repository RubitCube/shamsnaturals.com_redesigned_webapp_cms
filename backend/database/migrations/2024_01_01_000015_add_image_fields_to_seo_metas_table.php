<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seo_metas', function (Blueprint $table) {
            $table->json('image_seo')->nullable()->after('og_image'); // Store image alt/title: {main_image: {alt: '', title: ''}, decorative_image_1: {...}, ...}
        });
    }

    public function down(): void
    {
        Schema::table('seo_metas', function (Blueprint $table) {
            $table->dropColumn('image_seo');
        });
    }
};

