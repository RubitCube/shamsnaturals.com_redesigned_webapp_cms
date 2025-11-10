# Shams Naturals E-commerce Website

A complete rebuild of Shamsnaturals.com e-commerce website and admin CMS using modern, performance-driven technology stack.

## Technology Stack

### Frontend
- **React.js** with **TypeScript**
- **Tailwind CSS** for responsive, modern interface
- **React Router** for navigation
- **Axios** for API calls
- **Google Maps API** for dealer locations
- **reCAPTCHA** for contact form

### Backend
- **Laravel 11** based CMS
- **MySQL** database
- **Laravel Sanctum** for authentication
- **RESTful API** architecture

## Features

### Admin CMS
- Full CRUD operations for Products, Categories, Subcategories
- Banner management for homepage
- Dealer management with Google Maps integration
- Blog & Events posting system
- SEO optimization fields (meta title, description, tags)
- Media uploads (images, descriptions, pricing)
- Secure admin authentication

### Frontend Pages
1. **Homepage** - Banner image gallery, best 10 eco-friendly bags, new arrivals section
2. **Products Page** - All bags with categories and subcategories
3. **Product Detail Page** - Individual product view with images and details
4. **New Arrivals Page** - Latest products
5. **About Us Page** - Company profile details (CMS managed)
6. **Dealer Network Page** - Google Maps with accordion, automatic markers by country/state
7. **Contact Page** - reCAPTCHA-based enquiry form, Dubai and Poland address cards, dealer login button
8. **Blog Page** - Blog listings and detail pages

### Additional Features
- Floating vertical social media icons (Facebook, Instagram, YouTube, WhatsApp)
- Footer with quick nav links and copyright
- SEO meta tags per page
- Responsive design
- Clean URLs (e.g., /products/category/subcategory)

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure `.env` file with your database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shamsnaturals
DB_USERNAME=root
DB_PASSWORD=

GOOGLE_MAPS_API_KEY=your_google_maps_api_key
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
FRONTEND_URL=http://localhost:3000
```

6. Run migrations:
```bash
php artisan migrate
```

7. Create storage link:
```bash
php artisan storage:link
```

8. Start the server:
```bash
php artisan serve
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Configure `.env` file:
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints
- `GET /api/v1/homepage` - Homepage data
- `GET /api/v1/products` - All products
- `GET /api/v1/products/best` - Best products
- `GET /api/v1/products/new-arrivals` - New arrivals
- `GET /api/v1/products/{slug}` - Product detail
- `GET /api/v1/categories` - All categories
- `GET /api/v1/banners` - All banners
- `GET /api/v1/dealers` - All dealers
- `GET /api/v1/blogs` - All blogs
- `GET /api/v1/pages/about` - About page
- `POST /api/v1/contact` - Submit contact form

### Admin Endpoints (Protected)
- `GET /api/v1/admin/products` - List products
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/{id}` - Update product
- `DELETE /api/v1/admin/products/{id}` - Delete product
- Similar endpoints for categories, banners, dealers, blogs, events, pages, and SEO

## Database Structure

- `users` - Admin and dealer users
- `categories` - Product categories
- `subcategories` - Product subcategories
- `products` - Products
- `product_images` - Product images
- `banners` - Homepage banners
- `dealers` - Dealer information
- `blogs` - Blog posts
- `events` - Events
- `pages` - CMS pages
- `seo_metas` - SEO metadata
- `contacts` - Contact form submissions

## Deployment

### Backend (Laravel)
1. Upload files to cPanel
2. Set document root to `public` directory
3. Configure database in `.env`
4. Run migrations: `php artisan migrate`
5. Create storage link: `php artisan storage:link`
6. Set proper file permissions

### Frontend (React)
1. Build for production: `npm run build`
2. Upload `dist` folder contents to web server
3. Configure API URL in production environment

## License

MIT

