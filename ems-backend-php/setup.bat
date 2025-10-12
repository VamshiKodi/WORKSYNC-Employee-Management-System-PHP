#!/bin/bash

# EMS PHP Backend Setup Script for Windows/XAMPP

echo "🚀 Setting up EMS PHP Backend for Windows/XAMPP..."
echo ""

# Check if we're in the right directory
if [ ! -f "composer.json" ]; then
    echo "❌ Error: composer.json not found. Please run this script from the ems-backend-php directory."
    exit 1
fi

echo "📋 Manual Setup Instructions for Windows/XAMPP:"
echo ""

echo "1. DOWNLOAD COMPOSER:"
echo "   - Go to: https://getcomposer.org/download/"
echo "   - Download and run Composer-Setup.exe"
echo "   - OR download composer.phar manually to this directory"
echo ""

echo "2. INSTALL DEPENDENCIES:"
echo "   Once Composer is installed, run:"
echo "   composer install"
echo ""

echo "3. CONFIGURE ENVIRONMENT:"
echo "   Copy .env.example to .env and edit with your settings:"
echo "   copy .env.example .env"
echo ""

echo "4. START THE SERVER:"
echo "   php -S localhost:8080 -t public"
echo ""

echo "5. TEST THE API:"
echo "   Open: http://localhost:8080/api/health"
echo ""

echo "📝 Alternative: If you have composer.phar in this directory:"
echo "   php composer.phar install"
echo ""

echo "🔧 Troubleshooting:"
echo "- Make sure XAMPP is running"
echo "- Check PHP path: C:\xampp\php\php.exe"
echo "- MongoDB should be running on localhost:27017"
echo ""

read -p "Press Enter to continue or Ctrl+C to exit..."
