# Deployment Guide - Test & Production Servers

## Server Configuration Overview

### Test Server

- **Primary Domain:** `https://rubitcubedev.com/`
- **Subdomain:** `https://ecobagdealers.rubitcubedev.com/`
- **Backend .env:** `backend/.env.testserver`
- **Frontend .env:** `.env.test` (project root)

### Production Server

- **Primary Domain:** `https://shamsbags.com/`
- **Subdomain:** `http://shamsnaturals.com/`
- **Backend .env:** `backend/.env.productionserver`
- **Frontend .env:** `.env.prod` (project root)

---

## Environment Files Structure

### Backend Environment Files

#### `backend/.env.testserver` (Test Server)

```env
APP_NAME="Shams Naturals - Test"
APP_ENV=testing
APP_KEY=base64:your_test_app_key_here
APP_DEBUG=true
APP_URL=https://rubitcubedev.com

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=shamsnaturals_test
DB_USERNAME=your_test_db_user
DB_PASSWORD=your_test_db_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@rubitcubedev.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

# Frontend URL (for CORS)
FRONTEND_URL=https://ecobagdealers.rubitcubedev.com

# API Keys
GOOGLE_MAPS_API_KEY=your_test_google_maps_key
RECAPTCHA_SITE_KEY=your_test_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_test_recaptcha_secret_key

# Timezone Configuration
APP_TIMEZONE=UTC
CLIENT_TIMEZONE=Asia/Dubai
ADMIN_TIMEZONE=Asia/Kolkata

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=rubitcubedev.com,ecobagdealers.rubitcubedev.com
SESSION_DOMAIN=.rubitcubedev.com
```

#### `backend/.env.productionserver` (Production Server)

```env
APP_NAME="Shams Naturals"
APP_ENV=production
APP_KEY=base64:your_production_app_key_here
APP_DEBUG=false
APP_URL=https://shamsbags.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=shamsnaturals_prod
DB_USERNAME=your_prod_db_user
DB_PASSWORD=your_prod_db_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@shamsbags.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

# Frontend URL (for CORS)
FRONTEND_URL=https://shamsnaturals.com

# API Keys
GOOGLE_MAPS_API_KEY=your_production_google_maps_key
RECAPTCHA_SITE_KEY=your_production_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_production_recaptcha_secret_key

# Timezone Configuration
APP_TIMEZONE=UTC
CLIENT_TIMEZONE=Asia/Dubai
ADMIN_TIMEZONE=Asia/Kolkata

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=shamsbags.com,shamsnaturals.com
SESSION_DOMAIN=.shamsbags.com
```

### Frontend Environment Files

#### `.env.test` (Test Server - Project Root)

```env
# API Base URL
VITE_API_URL=https://rubitcubedev.com/api/v1

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_test_google_maps_key

# reCAPTCHA Site Key
VITE_RECAPTCHA_SITE_KEY=your_test_recaptcha_site_key
```

#### `.env.prod` (Production Server - Project Root)

```env
# API Base URL
VITE_API_URL=https://shamsbags.com/api/v1
# Note: API can be at shamsbags.com/api/v1 or api.shamsbags.com

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_key

# reCAPTCHA Site Key
VITE_RECAPTCHA_SITE_KEY=your_production_recaptcha_site_key
```

---

## How to Use Environment Files

### For Test Server Deployment

1. **Copy the appropriate .env file:**

   ```bash
   # In backend directory
   cp .env.testserver .env

   # In project root (for frontend build)
   cp .env.test .env
   ```

2. **Generate application key (if needed):**

   ```bash
   cd backend
   php artisan key:generate
   ```

3. **Build frontend with test environment:**
   ```bash
   # From project root
   cp .env.test .env
   cd frontend
   npm run build
   ```

### For Production Server Deployment

1. **Copy the appropriate .env file:**

   ```bash
   # In backend directory
   cp .env.productionserver .env

   # In project root (for frontend build)
   cp .env.prod .env
   ```

2. **Generate application key (if needed):**

   ```bash
   cd backend
   php artisan key:generate
   ```

3. **Build frontend with production environment:**
   ```bash
   # From project root
   cp .env.prod .env
   cd frontend
   npm run build
   ```

---

## .htaccess Configuration

### Backend .htaccess (`backend/public/.htaccess`)

This file should work for both test and production servers:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Force HTTPS (Production only - comment out for test server if needed)
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    # Prevent clickjacking
    Header always set X-Frame-Options "SAMEORIGIN"

    # XSS Protection
    Header always set X-XSS-Protection "1; mode=block"

    # Prevent MIME type sniffing
    Header always set X-Content-Type-Options "nosniff"

    # Referrer Policy
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Remove server signature
    Header unset Server
    Header unset X-Powered-By
</IfModule>

# Disable directory browsing
Options -Indexes

# Protect .env files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### Frontend .htaccess (Root Directory for Frontend)

Create this file in your frontend root directory (where `dist/` contents are uploaded`):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Force HTTPS (Production only - comment out for test server if needed)
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle React Router - redirect all requests to index.html
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/json "access plus 0 seconds"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Disable directory browsing
Options -Indexes
```

---

## Build Process

### Test Server Build

```bash
# 1. Set up backend environment
cd backend
cp .env.testserver .env
php artisan key:generate  # Only if key doesn't exist
php artisan config:clear
php artisan cache:clear

# 2. Set up frontend environment and build
cd ..
cp .env.test .env
cd frontend
npm install  # Only if node_modules don't exist
npm run build

# 3. The built files will be in frontend/dist/
```

### Production Server Build

```bash
# 1. Set up backend environment
cd backend
cp .env.productionserver .env
php artisan key:generate  # Only if key doesn't exist
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 2. Set up frontend environment and build
cd ..
cp .env.prod .env
cd frontend
npm install  # Only if node_modules don't exist
npm run build

# 3. The built files will be in frontend/dist/
```

---

## Deployment Steps

### Test Server Deployment

#### Backend Deployment

1. **Upload backend files** to cPanel (excluding `vendor/`, `node_modules/`, `.env` files)
2. **Set document root** to `backend/public` directory
3. **SSH into server** and run:
   ```bash
   cd /path/to/backend
   cp .env.testserver .env
   composer install --no-dev --optimize-autoloader
   php artisan key:generate  # If needed
   php artisan migrate
   php artisan storage:link
   php artisan config:clear
   php artisan cache:clear
   ```
4. **Set permissions:**
   ```bash
   chmod -R 755 storage bootstrap/cache
   chmod -R 644 .env
   ```

#### Frontend Deployment

1. **Build frontend** locally with test environment:
   ```bash
   cp .env.test .env
   cd frontend
   npm run build
   ```
2. **Upload contents** of `frontend/dist/` to the web root directory
3. **Upload `.htaccess`** file to the web root

### Production Server Deployment

#### Backend Deployment

1. **Upload backend files** to cPanel (excluding `vendor/`, `node_modules/`, `.env` files)
2. **Set document root** to `backend/public` directory
3. **SSH into server** and run:
   ```bash
   cd /path/to/backend
   cp .env.productionserver .env
   composer install --no-dev --optimize-autoloader
   php artisan key:generate  # If needed
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
4. **Set permissions:**
   ```bash
   chmod -R 755 storage bootstrap/cache
   chmod -R 644 .env
   ```

#### Frontend Deployment

1. **Build frontend** locally with production environment:
   ```bash
   cp .env.prod .env
   cd frontend
   npm run build
   ```
2. **Upload contents** of `frontend/dist/` to the web root directory
3. **Upload `.htaccess`** file to the web root

---

## cPanel Configuration

### Document Root Settings

#### For Backend API:

- **Document Root:** `/public_html/backend/public` (or your backend path)
- **Subdomain:** `api.rubitcubedev.com` or `api.shamsbags.com` (if using subdomain for API)

#### For Frontend:

- **Document Root:** `/public_html/` (main domain root)
- **Primary Domain:** Points to frontend files

### Subdomain Setup

#### Test Server:

- `rubitcubedev.com` → Frontend
- `ecobagdealers.rubitcubedev.com` → Dealer portal (if separate)
- API can be at `rubitcubedev.com/api/v1` or `api.rubitcubedev.com`

#### Production Server:

- `shamsbags.com` → Frontend
- `shamsnaturals.com` → Alternative frontend domain
- API can be at `shamsbags.com/api/v1` or `api.shamsbags.com`

---

## Environment Variable Management Script

Create a helper script to switch between environments:

### `switch-env.sh` (Linux/Mac)

```bash
#!/bin/bash

if [ "$1" == "test" ]; then
    echo "Switching to TEST environment..."
    cp backend/.env.testserver backend/.env
    cp .env.test .env
    echo "✓ Test environment activated"
elif [ "$1" == "prod" ]; then
    echo "Switching to PRODUCTION environment..."
    cp backend/.env.productionserver backend/.env
    cp .env.prod .env
    echo "✓ Production environment activated"
else
    echo "Usage: ./switch-env.sh [test|prod]"
fi
```

### `switch-env.bat` (Windows)

```batch
@echo off
if "%1"=="test" (
    echo Switching to TEST environment...
    copy backend\.env.testserver backend\.env
    copy .env.test .env
    echo ✓ Test environment activated
) else if "%1"=="prod" (
    echo Switching to PRODUCTION environment...
    copy backend\.env.productionserver backend\.env
    copy .env.prod .env
    echo ✓ Production environment activated
) else (
    echo Usage: switch-env.bat [test^|prod]
)
```

---

## Important Notes

1. **Never commit .env files** to Git - they should be in `.gitignore`
2. **Always use HTTPS** in production (uncomment HTTPS redirect in .htaccess)
3. **Set APP_DEBUG=false** in production
4. **Use different API keys** for test and production
5. **Clear caches** after environment changes:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   ```
6. **Test the build locally** before deploying
7. **Backup database** before running migrations in production
8. **Set proper file permissions** on the server (755 for directories, 644 for files)

---

## Troubleshooting

### Common Issues

1. **Environment variables not loading:**

   - Clear config cache: `php artisan config:clear`
   - Verify .env file is in correct location
   - Check file permissions

2. **CORS errors:**

   - Verify `FRONTEND_URL` in backend .env matches frontend domain
   - Check `SANCTUM_STATEFUL_DOMAINS` includes all domains
   - Clear config cache

3. **API not found (404):**

   - Verify document root is set to `backend/public`
   - Check .htaccess file exists and is correct
   - Verify mod_rewrite is enabled

4. **Frontend routing issues:**
   - Ensure .htaccess is in frontend root
   - Verify all routes redirect to index.html
   - Check build was done with correct environment

---

## Quick Reference

### Test Server URLs

- Frontend: `https://rubitcubedev.com`
- API: `https://rubitcubedev.com/api/v1`
- Dealer Portal: `https://ecobagdealers.rubitcubedev.com`

### Production Server URLs

- Frontend: `https://shamsbags.com` or `http://shamsnaturals.com`
- API: `https://shamsbags.com/api/v1`

### Build Commands

```bash
# Test
cp .env.test .env && cd frontend && npm run build

# Production
cp .env.prod .env && cd frontend && npm run build
```

---

**Last Updated:** November 21, 2025
