# Environment Setup - Quick Reference

## File Structure

```
ecommerce_webapp_demo/
├── .env.test                    # Frontend test environment
├── .env.prod                    # Frontend production environment
├── .htaccess                    # Frontend .htaccess (for React Router)
├── switch-env.sh                # Environment switcher (Linux/Mac)
├── switch-env.bat              # Environment switcher (Windows)
├── build-deploy.sh             # Build script
├── backend/
│   ├── .env.testserver         # Backend test environment
│   ├── .env.productionserver   # Backend production environment
│   ├── .env                    # Active backend environment (generated)
│   └── public/
│       └── .htaccess          # Backend .htaccess
└── frontend/
    └── dist/                   # Build output directory
```

## Quick Commands

### Switch Environment

**Linux/Mac:**
```bash
./switch-env.sh test    # Switch to test
./switch-env.sh prod    # Switch to production
```

**Windows:**
```cmd
switch-env.bat test     # Switch to test
switch-env.bat prod    # Switch to production
```

### Build for Deployment

**Linux/Mac:**
```bash
./build-deploy.sh test    # Build for test server
./build-deploy.sh prod    # Build for production server
```

**Manual Build:**
```bash
# Test
./switch-env.sh test
cd frontend && npm run build

# Production
./switch-env.sh prod
cd frontend && npm run build
```

## Environment File Locations

| Environment | Backend File | Frontend File |
|------------|--------------|---------------|
| Test | `backend/.env.testserver` | `.env.test` |
| Production | `backend/.env.productionserver` | `.env.prod` |
| Active | `backend/.env` | `.env` |

## Server URLs

### Test Server
- Frontend: `https://rubitcubedev.com`
- API: `https://rubitcubedev.com/api/v1`
- Dealer: `https://ecobagdealers.rubitcubedev.com`

### Production Server
- Frontend: `https://shamsbags.com` / `http://shamsnaturals.com`
- API: `https://shamsbags.com/api/v1`

## Deployment Checklist

### Test Server
- [ ] Copy `backend/.env.testserver` to `backend/.env` on server
- [ ] Copy `.env.test` to `.env` before building frontend
- [ ] Build frontend: `npm run build`
- [ ] Upload `frontend/dist/` contents to web root
- [ ] Upload `.htaccess` to web root
- [ ] Set backend document root to `backend/public`
- [ ] Run `composer install --no-dev` on server
- [ ] Run `php artisan migrate` on server
- [ ] Run `php artisan storage:link` on server
- [ ] Set file permissions (755 for dirs, 644 for files)

### Production Server
- [ ] Copy `backend/.env.productionserver` to `backend/.env` on server
- [ ] Copy `.env.prod` to `.env` before building frontend
- [ ] Build frontend: `npm run build`
- [ ] Upload `frontend/dist/` contents to web root
- [ ] Upload `.htaccess` to web root
- [ ] Set backend document root to `backend/public`
- [ ] Run `composer install --no-dev --optimize-autoloader` on server
- [ ] Run `php artisan migrate --force` on server
- [ ] Run `php artisan storage:link` on server
- [ ] Run `php artisan config:cache` on server
- [ ] Run `php artisan route:cache` on server
- [ ] Run `php artisan view:cache` on server
- [ ] Set file permissions (755 for dirs, 644 for files)
- [ ] Uncomment HTTPS redirect in `.htaccess`
- [ ] Verify `APP_DEBUG=false` in `.env`

## Important Notes

1. **Never commit .env files** - They're in `.gitignore`
2. **Always use different API keys** for test and production
3. **Test locally** before deploying
4. **Backup database** before migrations in production
5. **Clear caches** after environment changes
6. **Use HTTPS** in production (uncomment in .htaccess)

## Troubleshooting

### Environment not switching?
- Check file exists: `ls backend/.env.testserver`
- Verify permissions: `chmod 644 backend/.env.testserver`

### Build fails?
- Check `.env` file exists in project root
- Verify `VITE_API_URL` is set correctly
- Clear node_modules: `rm -rf frontend/node_modules && npm install`

### API not working?
- Verify backend `.env` file is correct
- Check document root is set to `backend/public`
- Verify `.htaccess` exists in `backend/public/`
- Clear config cache: `php artisan config:clear`

---

For detailed information, see `DEPLOYMENT_GUIDE.md`

