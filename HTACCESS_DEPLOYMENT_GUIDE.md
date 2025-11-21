# .htaccess Files Deployment Guide

## File Structure

This guide explains which .htaccess file to use where for both test and production servers.

## Production Server Files

### 1. `.htaccess.production-frontend`

- **Location:** Web root of `shamsnaturals.com` subdomain (where frontend/dist/ contents are uploaded)
- **Purpose:** Handles React Router, security, caching, compression
- **Rename to:** `.htaccess` when deploying

### 2. `.htaccess.production-primary`

- **Location:** Web root of `shamsbags.com` primary domain
- **Purpose:** Redirects primary domain to subdomain (shamsnaturals.com)
- **Rename to:** `.htaccess` when deploying

### 3. `backend/public/.htaccess.production`

- **Location:** `backend/public/` directory on server
- **Purpose:** Laravel API routing, security, CORS
- **Rename to:** `.htaccess` when deploying

## Test Server Files

### 1. `.htaccess.test-frontend`

- **Location:** Web root of `ecobagdealers.rubitcubedev.com` subdomain (where frontend/dist/ contents are uploaded)
- **Purpose:** Handles React Router, security, caching, compression
- **Rename to:** `.htaccess` when deploying

### 2. `.htaccess.test-primary`

- **Location:** Web root of `rubitcubedev.com` primary domain
- **Purpose:** Redirects primary domain to subdomain (ecobagdealers.rubitcubedev.com)
- **Rename to:** `.htaccess` when deploying

### 3. `backend/public/.htaccess.test`

- **Location:** `backend/public/` directory on server
- **Purpose:** Laravel API routing, security, CORS
- **Rename to:** `.htaccess` when deploying

## Deployment Instructions

### Production Server Deployment

#### Step 1: Frontend .htaccess

```bash
# On your local machine
cp .htaccess.production-frontend .htaccess

# Upload to server at: shamsnaturals.com web root
# (Same directory where frontend/dist/ contents are uploaded)
```

#### Step 2: Primary Domain .htaccess

```bash
# On your local machine
cp .htaccess.production-primary .htaccess

# Upload to server at: shamsbags.com web root
# (This is the primary domain that redirects to subdomain)
```

#### Step 3: Backend .htaccess

```bash
# On your local machine
cp backend/public/.htaccess.production backend/public/.htaccess

# Upload to server at: backend/public/ directory
# (Set document root to this directory in cPanel)
```

### Test Server Deployment

#### Step 1: Frontend .htaccess

```bash
# On your local machine
cp .htaccess.test-frontend .htaccess

# Upload to server at: ecobagdealers.rubitcubedev.com web root
# (Same directory where frontend/dist/ contents are uploaded)
```

#### Step 2: Primary Domain .htaccess

```bash
# On your local machine
cp .htaccess.test-primary .htaccess

# Upload to server at: rubitcubedev.com web root
# (This is the primary domain that redirects to subdomain)
```

#### Step 3: Backend .htaccess

```bash
# On your local machine
cp backend/public/.htaccess.test backend/public/.htaccess

# Upload to server at: backend/public/ directory
# (Set document root to this directory in cPanel)
```

## Key Features Preserved from Old .htaccess

✅ **Security:**

- Block sensitive files (.env, composer.json, etc.)
- Block malicious query strings
- Block bad bots
- Security headers

✅ **PHP Settings:**

- PHP 8.2 handler
- Memory limits (512M)
- Upload limits (512M)
- Execution time (60s for frontend, 300s for backend)
- cPanel-generated directives preserved

✅ **Performance:**

- Gzip compression
- Static asset caching
- Browser-specific compression rules

✅ **Domain Redirects:**

- Primary domain → Subdomain redirects
- HTTPS enforcement
- Subdomain variation redirects

## New Features Added

✅ **React Router Support:**

- All routes redirect to index.html
- Preserves client-side routing

✅ **Laravel API Routing:**

- Proper Laravel routing rules
- Authorization header handling
- Trailing slash redirects

✅ **Enhanced Security:**

- Modern security headers
- CORS configuration
- Server signature removal

## Verification Checklist

After deployment, verify:

- [ ] Frontend loads correctly at subdomain
- [ ] Primary domain redirects to subdomain
- [ ] React Router works (try navigating to different pages)
- [ ] API endpoints work (test /api/v1/products)
- [ ] HTTPS is enforced
- [ ] Images and assets load correctly
- [ ] No 404 errors for React routes
- [ ] CORS works for API calls

## Troubleshooting

### React Router 404 Errors

- Ensure `.htaccess` is in the frontend web root
- Verify RewriteRule for index.html is present
- Check mod_rewrite is enabled

### API Not Working

- Verify `.htaccess` is in `backend/public/`
- Check document root is set to `backend/public/`
- Verify mod_rewrite is enabled
- Check Laravel routes are cached: `php artisan route:cache`

### Redirects Not Working

- Verify RewriteEngine is On
- Check domain patterns match your actual domains
- Clear browser cache

### HTTPS Not Enforcing

- Verify SSL certificate is installed
- Check RewriteCond for HTTPS
- Verify mod_rewrite is enabled

---

**Last Updated:** November 21, 2025
