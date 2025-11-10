<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\BannerController;
use App\Http\Controllers\API\DealerController;
use App\Http\Controllers\API\BlogController;
use App\Http\Controllers\API\EventController;
use App\Http\Controllers\API\PageController;
use App\Http\Controllers\API\ContactController;

// Public API Routes
Route::prefix('v1')->group(function () {
    // Homepage
    Route::get('/homepage', [PageController::class, 'homepage']);
    
    // Banners
    Route::get('/banners', [BannerController::class, 'index']);
    
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/best', [ProductController::class, 'bestProducts']);
    Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/products/category/{category}', [ProductController::class, 'byCategory']);
    Route::get('/products/category/{category}/subcategory/{subcategory}', [ProductController::class, 'bySubcategory']);
    
    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    
    // Dealers
    Route::get('/dealers', [DealerController::class, 'index']);
    Route::get('/dealers/country/{country}', [DealerController::class, 'byCountry']);
    Route::get('/dealers/country/{country}/state/{state}', [DealerController::class, 'byState']);
    
    // Blog
    Route::get('/blogs', [BlogController::class, 'index']);
    Route::get('/blogs/{slug}', [BlogController::class, 'show']);
    
    // Events
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{slug}', [EventController::class, 'show']);
    
    // Pages
    Route::get('/pages/about', [PageController::class, 'about']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);
    
    // Contact
    Route::post('/contact', [ContactController::class, 'store']);
});

// Protected Admin Routes
Route::prefix('v1/admin')->middleware('auth:sanctum')->group(function () {
    // Products
    Route::apiResource('products', \App\Http\Controllers\Admin\ProductController::class);
    Route::post('products/{id}/upload', [\App\Http\Controllers\Admin\ProductController::class, 'uploadImage']);
    
    // Categories
    Route::apiResource('categories', \App\Http\Controllers\Admin\CategoryController::class);
    
    // Banners
    Route::apiResource('banners', \App\Http\Controllers\Admin\BannerController::class);
    Route::post('banners/{id}/upload', [\App\Http\Controllers\Admin\BannerController::class, 'uploadImage']);
    
    // Dealers
    Route::apiResource('dealers', \App\Http\Controllers\Admin\DealerController::class);
    
    // Countries & States
    Route::get('countries', [\App\Http\Controllers\Admin\CountryController::class, 'index']);
    Route::post('countries', [\App\Http\Controllers\Admin\CountryController::class, 'store']);
    Route::get('countries/{country}', [\App\Http\Controllers\Admin\CountryController::class, 'show']);
    Route::put('countries/{country}', [\App\Http\Controllers\Admin\CountryController::class, 'update']);
    Route::delete('countries/{country}', [\App\Http\Controllers\Admin\CountryController::class, 'destroy']);
    Route::patch('countries/{country}/toggle-status', [\App\Http\Controllers\Admin\CountryController::class, 'toggleStatus']);

    Route::get('countries/{country}/states', [\App\Http\Controllers\Admin\StateController::class, 'index']);
    Route::post('countries/{country}/states', [\App\Http\Controllers\Admin\StateController::class, 'store']);
    Route::get('states/{state}', [\App\Http\Controllers\Admin\StateController::class, 'show']);
    Route::put('states/{state}', [\App\Http\Controllers\Admin\StateController::class, 'update']);
    Route::delete('states/{state}', [\App\Http\Controllers\Admin\StateController::class, 'destroy']);
    Route::patch('states/{state}/toggle-status', [\App\Http\Controllers\Admin\StateController::class, 'toggleStatus']);
    
    // Blogs
    Route::apiResource('blogs', \App\Http\Controllers\Admin\BlogController::class);
    
    // Events
    Route::apiResource('events', \App\Http\Controllers\Admin\EventController::class);
    
    // Pages
    Route::apiResource('pages', \App\Http\Controllers\Admin\PageController::class);
    Route::post('pages/{id}/upload-image', [\App\Http\Controllers\Admin\PageController::class, 'uploadImage']);
    Route::post('pages/{id}/remove-image', [\App\Http\Controllers\Admin\PageController::class, 'removeImage']);
    
    // SEO
    Route::get('/seo', [\App\Http\Controllers\Admin\SeoController::class, 'index']);
    Route::get('/seo/{type}/{id}', [\App\Http\Controllers\Admin\SeoController::class, 'show']);
    Route::put('/seo/{type}/{id}', [\App\Http\Controllers\Admin\SeoController::class, 'update']);
});

// Auth Routes
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

