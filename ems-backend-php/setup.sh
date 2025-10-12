#!/bin/bash

# EMS PHP Backend Setup Script

echo "🚀 Setting up EMS PHP Backend..."

# Check if composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer first."
    echo "   Visit: https://getcomposer.org/download/"
    exit 1
fi

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Copy .env.example to .env if .env doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your database credentials."
else
    echo "✅ .env file already exists."
fi

# Set permissions for logs directory
chmod 755 logs

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file with your database credentials"
echo "2. Start the server: php -S localhost:8080 -t public"
echo "3. Test the API: http://localhost:8080/api/health"
echo ""
echo "API Endpoints:"
echo "- POST /api/auth/login - User login"
echo "- POST /api/auth/register - User registration"
echo "- GET /api/employees - Get all employees (requires auth)"
echo "- GET /api/health - Health check"
echo ""
echo "For development with auto-reload, you can use:"
echo "composer exec --verbose -- php -S localhost:8080 -t public"
