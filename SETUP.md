# Setup Guide - Shams Naturals E-commerce

## Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 5.7+
- Google Maps API Key
- reCAPTCHA Site Key & Secret Key

### Backend Setup (Laravel)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Update `.env` file:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=shamsnaturals
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

5. **Run migrations:**
   ```bash
   php artisan migrate
   ```

6. **Create storage link:**
   ```bash
   php artisan storage:link
   ```

7. **Start Laravel server:**
   ```bash
   php artisan serve
   ```
   Server will run on `http://localhost:8000`

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` file:**
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000`

## Creating Admin User

After running migrations, create an admin user:

```bash
php artisan tinker
```

Then run:
```php
$user = new App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@shamsnaturals.com';
$user->password = Hash::make('your_password');
$user->role = 'admin';
$user->save();
```

## API Testing

You can test the API endpoints using:
- Postman
- cURL
- Browser (for GET requests)

Example:
```bash
curl http://localhost:8000/api/v1/products
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```
Output will be in `frontend/dist/` directory.

### Backend
1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Run `php artisan view:cache`

## Deployment to cPanel

### Backend
1. Upload all backend files to your cPanel
2. Set document root to `public` directory
3. Configure `.env` with production database credentials
4. Run migrations: `php artisan migrate`
5. Create storage link: `php artisan storage:link`
6. Set proper file permissions (755 for directories, 644 for files)

### Frontend
1. Build the frontend: `npm run build`
2. Upload contents of `dist/` folder to your web root
3. Configure API URL to point to your Laravel backend
4. Update `.env` with production API URL

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check `config/cors.php` settings

### Image Upload Issues
- Ensure `storage/app/public` directory exists and is writable
- Run `php artisan storage:link` to create symlink

### Google Maps Not Loading
- Verify API key is correct
- Check API key restrictions in Google Cloud Console
- Ensure Maps JavaScript API is enabled

### reCAPTCHA Not Working
- Verify site key and secret key are correct
- Check domain restrictions in reCAPTCHA settings

## Support

For issues or questions, please refer to the main README.md file.

