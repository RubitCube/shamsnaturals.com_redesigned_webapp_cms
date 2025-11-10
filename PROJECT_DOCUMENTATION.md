# Shams Naturals E-Commerce Website & Admin CMS - Complete Documentation

**Last Updated:** November 10, 2025  
**Project:** Complete rebuild of Shamsnaturals.com e-commerce website and admin CMS

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features Implemented](#features-implemented)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Admin CMS Features](#admin-cms-features)
9. [Setup Instructions](#setup-instructions)
10. [Development History](#development-history)

---

## Project Overview

This is a complete rebuild of the Shams Naturals e-commerce website featuring:
- Modern React.js + TypeScript frontend with Tailwind CSS
- Laravel 11 backend API
- Comprehensive Admin CMS for content management
- Full CRUD operations for all content types
- SEO optimization tools
- Image management with drag-and-drop
- Google Maps integration for dealer network

---

## Technology Stack

### Frontend
- **Framework:** React.js 18.2.0
- **Language:** TypeScript 5.2.2
- **Styling:** Tailwind CSS 3.3.6
- **Routing:** React Router DOM 6.20.0
- **HTTP Client:** Axios 1.6.2
- **Rich Text Editor:** React Quill 2.0.0
- **Build Tool:** Vite 7.2.2
- **Other Libraries:**
  - React Google reCAPTCHA 3.1.0
  - Google Maps API integration

### Backend
- **Framework:** Laravel 11
- **Database:** MySQL
- **Authentication:** Laravel Sanctum
- **Image Processing:** Intervention Image
- **Server:** Apache (cPanel shared hosting - AlmaLinux)

---

## Project Structure

```
ecommerce_webapp_demo/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── API/          # Public API endpoints
│   │   │   │   └── Admin/        # Admin CMS endpoints
│   │   │   └── Middleware/
│   │   └── Models/               # Eloquent models
│   ├── database/
│   │   ├── migrations/          # Database migrations
│   │   └── seeders/             # Database seeders
│   ├── routes/
│   │   └── api.php              # API routes
│   └── storage/
│       └── app/public/          # Uploaded files
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/           # Admin components
    │   │   └── Layout/          # Layout components
    │   ├── contexts/            # React contexts (Auth)
    │   ├── pages/               # Page components
    │   │   ├── admin/           # Admin pages
    │   │   └── [public pages]   # Public pages
    │   └── services/
    │       └── api.ts           # API service layer
    └── public/
```

---

## Features Implemented

### Public Frontend Features

1. **Homepage**
   - Banner carousel (page-specific banners)
   - Best seller products display (top 10)
   - New arrivals section
   - Responsive design

2. **Products Page**
   - Category and subcategory filtering
   - Product grid with images
   - Product detail pages with image galleries
   - Clean URLs: `/products/category/subcategory`

3. **About Us Page**
   - Two-column layout (content + image)
   - Background decorative images
   - Rich text content from CMS
   - Page-specific banners

4. **New Arrivals Page**
   - Dedicated page for new products
   - Page-specific banners

5. **Dealer Network Page**
   - Google Maps integration
   - Country/State filtering
   - Automatic marker placement
   - Accordion-style dealer listings

6. **Contact Page**
   - reCAPTCHA integration
   - Contact form with validation
   - Multiple address cards (Dubai, Poland)
   - Page-specific banners

7. **Blog & Events**
   - Blog listing page
   - Blog detail pages
   - Events listing
   - Event detail pages

8. **Layout Components**
   - Responsive navbar with mobile menu
   - Footer with quick links
   - Floating social media icons (Facebook, Instagram, YouTube, WhatsApp)

### Admin CMS Features

1. **Authentication**
   - Secure login system
   - Token-based authentication (Laravel Sanctum)
   - Protected routes
   - Session management

2. **Dashboard**
   - Overview statistics
   - Quick access to all management sections

3. **Products Management**
   - Full CRUD operations
   - Multiple image uploads
   - Category/Subcategory assignment
   - Pricing management
   - Stock quantity tracking
   - Flags: Best Seller, New Arrival, Featured, Active
   - Order/Display priority

4. **Categories Management**
   - Full CRUD operations
   - Image upload
   - Subcategories support
   - Display order management
   - Active/Inactive status

5. **Banners Management**
   - Full CRUD operations
   - Page-specific banners:
     - Homepage
     - About Us
     - New Arrivals
     - Dealers
     - Contact
   - Image upload
   - Link URLs
   - Display order
   - Active/Inactive status

6. **Dealers Management**
   - Full CRUD operations
   - Country/State selection
   - Google Maps coordinates
   - Contact information
   - Active/Inactive status

7. **Blogs Management**
   - Full CRUD operations
   - Rich text editor (React Quill)
   - Featured image upload
   - Excerpt field
   - Published/Unpublished status
   - Publication date

8. **Events Management**
   - Full CRUD operations
   - Rich text editor (React Quill)
   - Featured image upload
   - Event date
   - Location field
   - Published/Unpublished status

9. **Pages Management**
   - Full CRUD operations
   - Rich text editor (React Quill)
   - Separate image upload system:
     - Main Image (Right Column)
     - Decorative Image 1 (about02)
     - Decorative Image 2 (about03)
   - Drag-and-drop image upload
   - Active/Inactive status

10. **SEO Management** ⭐ NEW
    - Unified SEO management for all page types
    - Page-wise SEO configuration:
      - Pages
      - Products
      - Categories
      - Blogs
      - Events
    - Meta Tags:
      - Meta Title (required, max 255 chars)
      - Meta Description (max 500 chars)
      - Meta Keywords (max 500 chars)
      - OG Image URL
    - Image SEO (for Pages):
      - Alt text for each image
      - Title attribute for each image
    - Filter by type
    - Visual indicators (SEO configured/not configured)
    - Character counters
    - Real-time updates

---

## Database Schema

### Core Tables

1. **users** - Admin users
2. **categories** - Product categories
3. **subcategories** - Product subcategories
4. **products** - Product information
5. **product_images** - Product image gallery
6. **banners** - Banner images (with page field)
7. **dealers** - Dealer network information
8. **blogs** - Blog posts
9. **events** - Event listings
10. **pages** - Static pages (with images JSON field)
11. **seo_metas** - SEO metadata (polymorphic, with image_seo JSON field)
12. **contacts** - Contact form submissions
13. **sessions** - Laravel sessions
14. **personal_access_tokens** - Sanctum tokens

### Key Relationships

- Products → Categories (many-to-one)
- Products → Subcategories (many-to-one)
- Products → ProductImages (one-to-many)
- Products → SeoMeta (polymorphic one-to-one)
- Categories → SeoMeta (polymorphic one-to-one)
- Pages → SeoMeta (polymorphic one-to-one)
- Blogs → SeoMeta (polymorphic one-to-one)
- Events → SeoMeta (polymorphic one-to-one)

---

## API Endpoints

### Public API Endpoints (`/api/v1/`)

- `GET /homepage` - Homepage data (banners, best products, new arrivals)
- `GET /products` - All products (with filters)
- `GET /products/best` - Best seller products
- `GET /products/new-arrivals` - New arrival products
- `GET /products/{slug}` - Product detail
- `GET /products/category/{category}` - Products by category
- `GET /products/category/{category}/subcategory/{subcategory}` - Products by subcategory
- `GET /categories` - All categories
- `GET /categories/{slug}` - Category detail
- `GET /banners?page={page}` - Banners (filtered by page)
- `GET /dealers` - All dealers
- `GET /dealers/country/{country}` - Dealers by country
- `GET /dealers/country/{country}/state/{state}` - Dealers by state
- `GET /pages/about` - About page data
- `GET /pages/{slug}` - Page by slug
- `GET /blogs` - All blogs
- `GET /blogs/{slug}` - Blog detail
- `GET /events` - All events
- `GET /events/{slug}` - Event detail
- `POST /contact` - Submit contact form

### Admin API Endpoints (`/api/v1/admin/`)

**Authentication:**
- `POST /auth/login` - Admin login
- `POST /auth/logout` - Admin logout
- `GET /auth/user` - Get current user

**Products:**
- `GET /products` - List all products
- `GET /products/{id}` - Get product
- `POST /products` - Create product
- `POST /products/{id}` - Update product (FormData)
- `DELETE /products/{id}` - Delete product
- `POST /products/{id}/upload` - Upload product image

**Categories:**
- `GET /categories` - List all categories
- `GET /categories/{id}` - Get category
- `POST /categories` - Create category
- `POST /categories/{id}` - Update category (FormData)
- `DELETE /categories/{id}` - Delete category

**Banners:**
- `GET /banners` - List all banners
- `GET /banners/{id}` - Get banner
- `POST /banners` - Create banner
- `POST /banners/{id}` - Update banner (FormData)
- `DELETE /banners/{id}` - Delete banner
- `POST /banners/{id}/upload` - Upload banner image

**Dealers:**
- `GET /dealers` - List all dealers
- `GET /dealers/{id}` - Get dealer
- `POST /dealers` - Create dealer
- `POST /dealers/{id}` - Update dealer (FormData)
- `DELETE /dealers/{id}` - Delete dealer

**Blogs:**
- `GET /blogs` - List all blogs
- `GET /blogs/{id}` - Get blog
- `POST /blogs` - Create blog
- `POST /blogs/{id}` - Update blog (FormData)
- `DELETE /blogs/{id}` - Delete blog

**Events:**
- `GET /events` - List all events
- `GET /events/{id}` - Get event
- `POST /events` - Create event
- `POST /events/{id}` - Update event (FormData)
- `DELETE /events/{id}` - Delete event

**Pages:**
- `GET /pages` - List all pages
- `GET /pages/{id}` - Get page
- `POST /pages` - Create page
- `PUT /pages/{id}` - Update page
- `DELETE /pages/{id}` - Delete page
- `POST /pages/{id}/upload-image` - Upload page image
- `POST /pages/{id}/remove-image` - Remove page image

**SEO:**
- `GET /seo` - Get all items with SEO data
- `GET /seo/{type}/{id}` - Get SEO for specific item
- `PUT /seo/{type}/{id}` - Update SEO for specific item

---

## Frontend Components

### Admin Components

1. **AdminLayout** - Main admin layout with sidebar navigation
2. **ProtectedRoute** - Route protection for admin pages
3. **RichTextEditor** - React Quill-based rich text editor
4. **ImageUpload** - Drag-and-drop image upload component

### Public Components

1. **Navbar** - Main navigation bar
2. **Footer** - Site footer
3. **SocialIcons** - Floating social media icons
4. **BannerCarousel** - Banner carousel component
5. **ProductCard** - Product display card

### Pages

**Public:**
- HomePage
- ProductsPage
- ProductDetailPage
- NewArrivalsPage
- AboutPage
- DealersPage
- ContactPage
- BlogPage
- BlogDetailPage

**Admin:**
- AdminLogin
- AdminDashboard
- AdminProducts
- AdminCategories
- AdminBanners
- AdminDealers
- AdminBlogs
- AdminEvents
- AdminPages
- AdminSEO ⭐ NEW

---

## Admin CMS Features (Detailed)

### 1. Products Management
- **Create/Edit:** Name, description, pricing, SKU, stock
- **Images:** Multiple image uploads with primary image selection
- **Categories:** Category and subcategory assignment
- **Flags:** Best Seller, New Arrival, Featured, Active
- **Order:** Display priority

### 2. Categories Management
- **Create/Edit:** Name, description, image
- **Subcategories:** Support for nested categories
- **Order:** Display priority
- **Status:** Active/Inactive

### 3. Banners Management
- **Page Assignment:** Homepage, About, New Arrivals, Dealers, Contact
- **Image Upload:** High-quality banner images
- **Links:** Optional URL links
- **Order:** Display sequence
- **Status:** Active/Inactive
- **Filter:** Filter banners by page type

### 4. Dealers Management
- **Location:** Country and State selection
- **Coordinates:** Google Maps integration
- **Contact:** Name, email, phone, address
- **Status:** Active/Inactive

### 5. Blogs Management
- **Rich Text Editor:** Full formatting capabilities
- **Featured Image:** Main blog image
- **Excerpt:** Short description
- **Content:** Full blog content with rich text
- **Publishing:** Published/Unpublished status
- **Date:** Publication date

### 6. Events Management
- **Rich Text Editor:** Full formatting capabilities
- **Featured Image:** Main event image
- **Event Details:** Date, location, description
- **Content:** Full event content with rich text
- **Publishing:** Published/Unpublished status

### 7. Pages Management
- **Rich Text Editor:** Full formatting capabilities
- **Separate Image Upload System:**
  - Main Image (displays in right column)
  - Decorative Image 1 (about02 - background)
  - Decorative Image 2 (about03 - background)
- **Drag-and-Drop:** Easy image upload interface
- **Content:** Full page content with rich text
- **Status:** Active/Inactive

### 8. SEO Management ⭐ NEW
- **Unified Interface:** Manage SEO for all content types
- **Page Types Supported:**
  - Pages
  - Products
  - Categories
  - Blogs
  - Events
- **Meta Tags:**
  - Meta Title (required, 255 chars max)
  - Meta Description (500 chars max)
  - Meta Keywords (500 chars max)
  - OG Image URL
- **Image SEO (Pages only):**
  - Alt text for main image
  - Title attribute for main image
  - Alt text for decorative images
  - Title attributes for decorative images
- **Features:**
  - Filter by type
  - Visual status indicators
  - Character counters
  - Real-time updates
  - Two-column layout (list + editor)

---

## Setup Instructions

### Backend Setup

1. **Install Dependencies:**
   ```bash
   cd backend
   composer install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Configuration:**
   - Update `.env` with database credentials
   - Run migrations:
     ```bash
     php artisan migrate
     ```

4. **Storage Setup:**
   ```bash
   php artisan storage:link
   mkdir -p storage/app/public/{banners,products,categories,blogs,events,pages}
   ```

5. **Create Admin User:**
   ```bash
   php artisan db:seed --class=AdminUserSeeder
   ```
   Default credentials:
   - Email: `admin@shamsnaturals.com`
   - Password: `admin123`

6. **Start Server:**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration:**
   Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Backend:**
   - Upload files to cPanel
   - Set document root to `backend/public`
   - Configure `.env` for production
   - Run migrations
   - Set storage permissions

2. **Frontend:**
   ```bash
   npm run build
   ```
   - Upload `dist` folder contents to web root
   - Update `VITE_API_URL` in production `.env`

---

## Development History

### Phase 1: Initial Setup (November 2025)
- Project structure creation
- Laravel 11 backend setup
- React + TypeScript frontend setup
- Basic routing and authentication

### Phase 2: Core Features
- Database migrations for all tables
- Eloquent models creation
- API controllers (public and admin)
- Basic CRUD operations

### Phase 3: Admin CMS Development
- Admin authentication system
- Protected routes implementation
- Admin layout with sidebar navigation
- Full CRUD interfaces for:
  - Products
  - Categories
  - Banners
  - Dealers
  - Blogs
  - Events
  - Pages

### Phase 4: Frontend Development
- Public pages implementation
- Product catalog with filtering
- Category/Subcategory navigation
- Google Maps integration
- reCAPTCHA integration
- Responsive design

### Phase 5: Image Management Enhancement
- Separate image upload system for pages
- Drag-and-drop image upload component
- Image SEO (alt text and title attributes)
- Page-specific image placement

### Phase 6: SEO Management System ⭐ (November 10, 2025)
- Unified SEO management interface
- Support for all content types (Pages, Products, Categories, Blogs, Events)
- Meta tags management (Title, Description, Keywords, OG Image)
- Image SEO for pages (Alt text and Title attributes)
- Filter by type functionality
- Visual status indicators
- Character counters
- Real-time updates

### Key Fixes and Improvements

1. **CSRF Token Issues:**
   - Removed stateful middleware for token-based auth
   - Simplified authentication flow

2. **Boolean Field Handling:**
   - Fixed FormData boolean conversion using `filter_var()`
   - Updated all admin controllers

3. **Page-Specific Banners:**
   - Added `page` field to banners table
   - Implemented filtering by page type
   - Updated frontend to fetch page-specific banners

4. **About Page Layout:**
   - Two-column layout implementation
   - Background decorative images
   - Automatic image extraction from content
   - Precise image positioning

5. **Rich Text Editor:**
   - Integrated React Quill
   - Full formatting capabilities
   - Image embedding support

6. **Image Upload System:**
   - Created reusable ImageUpload component
   - Drag-and-drop functionality
   - Image preview
   - File validation

---

## Current Status

### ✅ Completed Features
- [x] Complete backend API
- [x] Admin authentication
- [x] All CRUD operations
- [x] Image upload system
- [x] Rich text editor
- [x] Page-specific banners
- [x] SEO management system
- [x] Image SEO (alt/title)
- [x] Public frontend pages
- [x] Responsive design

### 🔄 Future Enhancements (Potential)
- [ ] Product reviews and ratings
- [ ] Shopping cart functionality
- [ ] Payment gateway integration
- [ ] Order management system
- [ ] Email notifications
- [ ] Advanced search functionality
- [ ] Multi-language support
- [ ] Analytics integration

---

## Technical Notes

### Authentication
- Uses Laravel Sanctum for token-based authentication
- No CSRF protection needed for API endpoints
- Tokens stored in localStorage

### File Uploads
- All images stored in `storage/app/public/`
- Organized by type: `banners/`, `products/`, `categories/`, `blogs/`, `events/`, `pages/`
- Maximum file size: 5MB (configurable)

### SEO Implementation
- SEO data stored in `seo_metas` table (polymorphic)
- Image SEO stored as JSON in `image_seo` field
- Frontend automatically applies SEO data to meta tags and image attributes

### Image Management
- Pages use separate image fields (not embedded in content)
- Drag-and-drop upload interface
- Automatic image removal when page is deleted
- Support for multiple image types per page

---

## API Response Format

### Success Response
```json
{
  "data": [...],
  "message": "Success message"
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Error details"]
  }
}
```

---

## Environment Variables

### Backend (.env)
```
APP_NAME="Shams Naturals"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shamsnaturals
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Troubleshooting

### Common Issues

1. **CSRF Token Mismatch:**
   - Solution: Removed stateful middleware, using token-based auth

2. **Boolean Fields Not Saving:**
   - Solution: Use `filter_var()` to convert FormData strings to booleans

3. **Images Not Displaying:**
   - Check storage link: `php artisan storage:link`
   - Verify file permissions
   - Check image paths in database

4. **SEO Not Showing:**
   - Verify SEO data exists in `seo_metas` table
   - Check API response includes SEO data
   - Verify frontend is fetching SEO correctly

---

## Contact & Support

For issues or questions:
- Check Laravel logs: `backend/storage/logs/laravel.log`
- Check browser console for frontend errors
- Verify API responses in Network tab

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Maintained By:** Development Team

---

*This documentation is automatically maintained and should be updated with each major feature addition or change.*

