# EMS Backend - Employee Management System

A comprehensive backend API for the Employee Management System with authentication, employee management, and attendance tracking.

## 🚀 Features

### ✅ Implemented Features
- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, HR, Employee)
  - Secure password hashing with bcrypt
  - Password change functionality

- **Employee Management**
  - Complete CRUD operations for employee profiles
  - Advanced search and filtering
  - Department and status management
  - Employee statistics and analytics

- **Attendance Tracking**
  - Clock in/out functionality
  - Location tracking
  - Attendance history and reports
  - Late detection and status management
  - Comprehensive attendance analytics

### 🔄 Planned Features
- Leave Management System
- Payroll Management
- Task and Project Management
- Performance Evaluation
- Announcement System
- File Upload for Documents
- Multi-language Support
- Audit Logs

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd ems-backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

### 4. Seed the Database

```bash
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📊 Database Seeding

The application comes with pre-populated data for testing:

### Demo Users
- **Admin**: `admin` / `admin123`
- **HR Manager**: `hr_manager` / `hr123`
- **Employee**: `john.doe` / `emp123`

### Demo Employees
- John Doe (Engineering)
- Jane Smith (Marketing)
- Mike Johnson (HR)
- Sarah Wilson (Design)
- David Brown (Sales)

## 🔌 API Endpoints

### Authentication Routes
```
POST   /api/auth/login          - User login
POST   /api/auth/register       - Register new user (Admin only)
GET    /api/auth/me             - Get current user
PUT    /api/auth/change-password - Change password
GET    /api/auth/users          - Get all users (Admin only)
```

### Employee Routes
```
GET    /api/employees           - Get all employees (Admin/HR)
GET    /api/employees/:id       - Get single employee
POST   /api/employees           - Create employee (Admin/HR)
PUT    /api/employees/:id       - Update employee
DELETE /api/employees/:id       - Delete employee (Admin)
GET    /api/employees/stats/overview - Employee statistics
GET    /api/employees/search    - Search employees
```

### Attendance Routes
```
POST   /api/attendance/clock-in     - Clock in
POST   /api/attendance/clock-out    - Clock out
GET    /api/attendance/my-attendance - Get own attendance
GET    /api/attendance/employee/:id - Get employee attendance
GET    /api/attendance/all          - Get all attendance (Admin/HR)
PUT    /api/attendance/:id/approve  - Approve attendance
PUT    /api/attendance/:id          - Update attendance
GET    /api/attendance/stats/overview - Attendance statistics
GET    /api/attendance/current-status - Current attendance status
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full access to all features
- **HR**: Employee and attendance management
- **Employee**: View own profile and attendance

### JWT Token Usage
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Get Employees (with token)
```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Clock In
```bash
curl -X POST http://localhost:5000/api/attendance/clock-in \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "coordinates": [-73.935242, 40.730610]
    },
    "ipAddress": "192.168.1.1",
    "deviceInfo": "Chrome/91.0"
  }'
```

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Role-based Access**: Granular permission control

## 📊 Database Schema

### User Model
- username, email, password
- role (admin, hr, employee)
- employeeId (for employee users)
- isActive, lastLogin

### Employee Model
- employeeId, firstName, lastName
- email, phone, dateOfBirth
- address, department, position
- salary, hireDate, status
- emergencyContact, skills, notes

### Attendance Model
- employee, date
- clockIn/clockOut with location
- totalHours, status
- notes, approval status

## 🚀 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with demo data
```

### Project Structure
```
ems-backend/
├── config/           # Database configuration
├── middleware/       # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── scripts/         # Database seeding
├── server.js        # Main server file
└── package.json
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `FRONTEND_URL`: Frontend URL for CORS

## 📈 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading for large datasets
- **Caching**: Ready for Redis integration
- **Compression**: Response compression for better performance

## 🧪 Testing

The API is designed to be easily testable with tools like:
- Postman
- Insomnia
- curl
- Jest (for unit testing)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the error logs
- Ensure MongoDB is running
- Verify environment variables are set correctly

## 🔄 Next Steps

1. **Frontend Integration**: Connect with React frontend
2. **Additional Features**: Implement planned features
3. **Production Deployment**: Deploy to cloud platform
4. **Monitoring**: Add logging and monitoring
5. **Testing**: Comprehensive test suite 