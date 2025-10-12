# 🚀 EMS - Employee Management System (PHP Backend)

A modern REST API backend for the Employee Management System built with PHP, Slim Framework, and MongoDB.

## 📋 Overview

This PHP backend provides a complete REST API for employee management, authentication, and data persistence using MongoDB as the database.

## 🛠️ Tech Stack

### Backend
- **Runtime**: PHP 7.4+
- **Framework**: Slim Framework 4.0
- **Database**: MongoDB with PHP Driver
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: PHP's built-in `password_hash()`
- **Environment Management**: PHP dotenv
- **Validation**: Respect/Validation
- **Logging**: Monolog
- **HTTP Client**: Guzzle HTTP (for future use)

## 📁 Project Structure

```
ems-backend-php/
├── composer.json          # PHP dependencies
├── index.php             # Application entry point
├── .env.example          # Environment variables template
├── setup.sh             # Setup script
├── logs/                # Log files directory
├── public/              # Public web directory
├── api/                 # API endpoints (if needed)
├── uploads/             # File uploads directory
└── src/
    ├── config/
    │   └── Database.php  # MongoDB connection
    ├── controllers/
    │   ├── AuthController.php      # Authentication endpoints
    │   └── EmployeeController.php  # Employee management
    ├── helpers/
    │   └── JwtHelper.php           # JWT token utilities
    ├── middleware/
    │   └── AuthMiddleware.php      # Authentication middleware
    ├── models/
    │   ├── User.php        # User model
    │   └── Employee.php    # Employee model
    └── routes/
        └── ApiRoutes.php   # Route definitions
```

## 🚀 Quick Start

### Prerequisites
- PHP 7.4 or higher
- MongoDB (local or MongoDB Atlas)
- Composer (PHP dependency manager)

### Installation

1. **Install dependencies**
   ```bash
   composer install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the server**
   ```bash
   php -S localhost:8080 -t public
   ```

4. **Test the API**
   - Health check: `http://localhost:8080/api/health`
   - API documentation: Available at the endpoints

### Environment Configuration

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=ems_php
DB_USERNAME=
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=604800

# Application Configuration
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8080
```

## 📖 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "role": "employee"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Employee Endpoints

#### Get All Employees
```http
GET /api/employees?department=IT&status=active&limit=10&skip=0
Authorization: Bearer <jwt_token>
```

#### Get Employee by ID
```http
GET /api/employees/{id}
Authorization: Bearer <jwt_token>
```

#### Create Employee
```http
POST /api/employees
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "department": "Engineering",
  "position": "Software Engineer",
  "salary": 75000,
  "hireDate": "2023-01-15"
}
```

#### Update Employee
```http
PUT /api/employees/{id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "position": "Senior Software Engineer",
  "salary": 85000
}
```

#### Delete Employee
```http
DELETE /api/employees/{id}
Authorization: Bearer <jwt_token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** with username/email and password to get a token
2. **Include the token** in the `Authorization` header as `Bearer <token>`
3. **Token expires** after 7 days (configurable in `.env`)

## 🗃️ Database Models

### User Model
```php
[
  'username' => 'string (required, unique)',
  'email' => 'string (required, unique)',
  'password' => 'string (hashed)',
  'role' => 'enum: admin, hr, employee',
  'isActive' => 'boolean',
  'lastLogin' => 'datetime',
  'createdAt' => 'datetime',
  'updatedAt' => 'datetime'
]
```

### Employee Model
```php
[
  'employeeId' => 'string (auto-generated)',
  'user' => 'ObjectId (reference to User)',
  'firstName' => 'string (required)',
  'lastName' => 'string (required)',
  'email' => 'string (required, unique)',
  'phone' => 'string',
  'department' => 'string (required)',
  'position' => 'string (required)',
  'salary' => 'number',
  'hireDate' => 'datetime',
  'status' => 'enum: active, inactive, terminated, on_leave',
  'createdAt' => 'datetime',
  'updatedAt' => 'datetime'
]
```

## 🛠️ Development

### Running in Development Mode
```bash
php -S localhost:8080 -t public
```

### Adding New Endpoints

1. Create a new controller in `src/controllers/`
2. Add routes in `src/routes/ApiRoutes.php`
3. Register the controller in the routes file

### Database Operations

The MongoDB PHP driver is used for database operations. Collections are automatically created when first used.

## 🚢 Deployment

### Production Setup

1. **Install dependencies**
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

2. **Configure production environment**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   DB_HOST=your-production-mongo-host
   JWT_SECRET=your-production-secret
   ```

3. **Use a production server**
   - Apache with mod_php
   - Nginx with PHP-FPM
   - Docker container

### Recommended Production Stack
- **Web Server**: Nginx
- **PHP**: PHP-FPM 7.4+
- **Database**: MongoDB Atlas or self-hosted
- **SSL**: Let's Encrypt
- **Monitoring**: Application logs in `logs/` directory

## 🧪 Testing

Run PHPUnit tests (when implemented):
```bash
composer test
```

## 📊 Monitoring

- **Logs**: Check `logs/app.log` for application logs
- **Health Check**: `GET /api/health`
- **Database**: Monitor MongoDB connection and collections

## 🤝 Contributing

1. Follow PSR-12 coding standards
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the logs in `logs/app.log`
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check PHP error logs

---

**Happy coding! 🎉**
