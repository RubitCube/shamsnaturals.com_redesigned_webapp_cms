#!/bin/bash

# Build and Deploy Script for Shams Naturals
# Usage: ./build-deploy.sh [test|prod]

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: ./build-deploy.sh [test|prod]"
    exit 1
fi

if [ "$ENV" != "test" ] && [ "$ENV" != "prod" ]; then
    echo "Error: Environment must be 'test' or 'prod'"
    exit 1
fi

echo "🚀 Building for $ENV environment..."
echo ""

# Step 1: Switch environment
echo "Step 1: Switching environment..."
./switch-env.sh $ENV
if [ $? -ne 0 ]; then
    echo "❌ Failed to switch environment"
    exit 1
fi
echo ""

# Step 2: Backend setup
echo "Step 2: Setting up backend..."
cd backend

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

if [ "$ENV" == "prod" ]; then
    # Production: Cache configs
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    echo "✓ Production caches created"
else
    echo "✓ Test environment - caches cleared"
fi

cd ..
echo ""

# Step 3: Frontend build
echo "Step 3: Building frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✓ Frontend build completed"
echo "  Build output: frontend/dist/"
cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "Next steps for deployment:"
echo "  1. Upload backend files (excluding vendor, node_modules, .env files)"
echo "  2. Upload frontend/dist/ contents to web root"
echo "  3. On server:"
echo "     - Copy .env.testserver or .env.productionserver to .env"
echo "     - Run: composer install --no-dev --optimize-autoloader"
echo "     - Run: php artisan migrate"
echo "     - Run: php artisan storage:link"
echo "     - Set proper file permissions"

