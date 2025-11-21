#!/bin/bash

# Environment Switching Script for Shams Naturals
# Usage: ./switch-env.sh [test|prod]

if [ "$1" == "test" ]; then
    echo "🔄 Switching to TEST environment..."
    
    # Backend environment
    if [ -f "backend/.env.testserver" ]; then
        cp backend/.env.testserver backend/.env
        echo "✓ Backend: Test environment activated"
    else
        echo "✗ Error: backend/.env.testserver not found"
        exit 1
    fi
    
    # Frontend environment
    if [ -f ".env.test" ]; then
        cp .env.test .env
        echo "✓ Frontend: Test environment activated"
    else
        echo "✗ Error: .env.test not found"
        exit 1
    fi
    
    echo ""
    echo "✅ Test environment activated successfully!"
    echo "   - Backend: backend/.env"
    echo "   - Frontend: .env"
    echo ""
    echo "Next steps:"
    echo "   1. cd backend && php artisan config:clear"
    echo "   2. cd ../frontend && npm run build"
    
elif [ "$1" == "prod" ]; then
    echo "🔄 Switching to PRODUCTION environment..."
    
    # Backend environment
    if [ -f "backend/.env.productionserver" ]; then
        cp backend/.env.productionserver backend/.env
        echo "✓ Backend: Production environment activated"
    else
        echo "✗ Error: backend/.env.productionserver not found"
        exit 1
    fi
    
    # Frontend environment
    if [ -f ".env.prod" ]; then
        cp .env.prod .env
        echo "✓ Frontend: Production environment activated"
    else
        echo "✗ Error: .env.prod not found"
        exit 1
    fi
    
    echo ""
    echo "✅ Production environment activated successfully!"
    echo "   - Backend: backend/.env"
    echo "   - Frontend: .env"
    echo ""
    echo "Next steps:"
    echo "   1. cd backend && php artisan config:cache"
    echo "   2. cd ../frontend && npm run build"
    
else
    echo "Usage: ./switch-env.sh [test|prod]"
    echo ""
    echo "This script switches between test and production environments by:"
    echo "  - Copying backend/.env.testserver or backend/.env.productionserver to backend/.env"
    echo "  - Copying .env.test or .env.prod to .env (for frontend build)"
    exit 1
fi

