# Shams Naturals Backend API

Laravel 11 based CMS backend for Shams Naturals e-commerce website.

## Setup

1. Install dependencies: `composer install`
2. Copy `.env.example` to `.env` and configure
3. Generate key: `php artisan key:generate`
4. Run migrations: `php artisan migrate`
5. Create storage link: `php artisan storage:link`
6. Start server: `php artisan serve`

## API Documentation

All API endpoints are prefixed with `/api/v1`

### Authentication
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/user` - Get current user

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/best` - Get best products
- `GET /api/v1/products/new-arrivals` - Get new arrivals
- `GET /api/v1/products/{slug}` - Get product by slug

### Admin Products
- `GET /api/v1/admin/products` - List products (admin)
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/{id}` - Update product
- `DELETE /api/v1/admin/products/{id}` - Delete product
- `POST /api/v1/admin/products/{id}/upload` - Upload product image

Similar endpoints available for categories, banners, dealers, blogs, events, pages, and SEO.

