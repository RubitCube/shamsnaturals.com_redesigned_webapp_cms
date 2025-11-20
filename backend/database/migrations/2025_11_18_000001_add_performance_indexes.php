<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add indexes for frequently queried columns to improve query performance
        
        // Products table indexes
        Schema::table('products', function (Blueprint $table) {
            // Index for filtering active products
            if (!$this->indexExists('products', 'products_is_active_index')) {
                $table->index('is_active', 'products_is_active_index');
            }
            
            // Index for best sellers
            if (!$this->indexExists('products', 'products_is_best_seller_index')) {
                $table->index('is_best_seller', 'products_is_best_seller_index');
            }
            
            // Index for new arrivals
            if (!$this->indexExists('products', 'products_is_new_arrival_index')) {
                $table->index('is_new_arrival', 'products_is_new_arrival_index');
            }
            
            // Composite index for active + best seller queries
            if (!$this->indexExists('products', 'products_active_best_seller_index')) {
                $table->index(['is_active', 'is_best_seller'], 'products_active_best_seller_index');
            }
            
            // Composite index for active + new arrival queries
            if (!$this->indexExists('products', 'products_active_new_arrival_index')) {
                $table->index(['is_active', 'is_new_arrival'], 'products_active_new_arrival_index');
            }
            
            // Index for ordering
            if (!$this->indexExists('products', 'products_order_index')) {
                $table->index('order', 'products_order_index');
            }
            
            // Index for category_id (if not already indexed by foreign key)
            if (!$this->indexExists('products', 'products_category_id_index')) {
                $table->index('category_id', 'products_category_id_index');
            }
            
            // Index for subcategory_id
            if (!$this->indexExists('products', 'products_subcategory_id_index')) {
                $table->index('subcategory_id', 'products_subcategory_id_index');
            }
            
            // Index for created_at (used in new arrivals sorting)
            if (!$this->indexExists('products', 'products_created_at_index')) {
                $table->index('created_at', 'products_created_at_index');
            }
        });
        
        // Product images table indexes
        Schema::table('product_images', function (Blueprint $table) {
            // Composite index for ordering images by product
            if (!$this->indexExists('product_images', 'product_images_product_order_index')) {
                $table->index(['product_id', 'order', 'is_primary'], 'product_images_product_order_index');
            }
        });
        
        // Categories table indexes
        Schema::table('categories', function (Blueprint $table) {
            // Index for active categories
            if (!$this->indexExists('categories', 'categories_is_active_index')) {
                $table->index('is_active', 'categories_is_active_index');
            }
            
            // Index for ordering
            if (!$this->indexExists('categories', 'categories_order_index')) {
                $table->index('order', 'categories_order_index');
            }
        });
        
        // Banners table indexes
        Schema::table('banners', function (Blueprint $table) {
            // Composite index for active banners by page
            if (!$this->indexExists('banners', 'banners_active_page_index')) {
                $table->index(['is_active', 'page', 'order'], 'banners_active_page_index');
            }
        });
        
        // Events table indexes
        Schema::table('events', function (Blueprint $table) {
            // Index for published events
            if (!$this->indexExists('events', 'events_is_published_index')) {
                $table->index('is_published', 'events_is_published_index');
            }
            
            // Index for event date sorting
            if (!$this->indexExists('events', 'events_event_date_index')) {
                $table->index('event_date', 'events_event_date_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_is_active_index');
            $table->dropIndex('products_is_best_seller_index');
            $table->dropIndex('products_is_new_arrival_index');
            $table->dropIndex('products_active_best_seller_index');
            $table->dropIndex('products_active_new_arrival_index');
            $table->dropIndex('products_order_index');
            $table->dropIndex('products_category_id_index');
            $table->dropIndex('products_subcategory_id_index');
            $table->dropIndex('products_created_at_index');
        });
        
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropIndex('product_images_product_order_index');
        });
        
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_is_active_index');
            $table->dropIndex('categories_order_index');
        });
        
        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex('banners_active_page_index');
        });
        
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_is_published_index');
            $table->dropIndex('events_event_date_index');
        });
    }
    
    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        
        $result = $connection->select(
            "SELECT COUNT(*) as count FROM information_schema.statistics 
             WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$databaseName, $table, $index]
        );
        
        return $result[0]->count > 0;
    }
};

