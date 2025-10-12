# 📖 EMS API Documentation

Comprehensive API documentation for the Employee Management System backend.

## 🔗 Base URL

```
http://localhost:5000/api
```

## 🔐 Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "admin",
    "role": "admin",
    "employeeId": null
  }
}
```

---

## 👥 Employee Management

### Get All Employees
```http
GET /api/employees
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name, email, or employee ID
- `department` (optional): Filter by department
- `status` (optional): Filter by status (active, inactive)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "emp_id",
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+1234567890",
      "department": "Engineering",
      "position": "Software Engineer",
      "salary": 75000,
      "hireDate": "2023-01-15",
      "status": "active",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "emergencyContact": {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "phone": "+1234567891"
      },
      "skills": ["JavaScript", "React", "Node.js"],
      "notes": "Excellent performance"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Employee by ID
```http
GET /api/employees/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp_id",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "department": "Engineering",
    "position": "Software Engineer",
    "salary": 75000,
    "hireDate": "2023-01-15",
    "status": "active",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1234567891"
    },
    "skills": ["JavaScript", "React", "Node.js"],
    "notes": "Excellent performance"
  }
}
```

### Create Employee
```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "EMP002",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1234567891",
  "dateOfBirth": "1990-05-15",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210"
  },
  "department": "Marketing",
  "position": "Marketing Manager",
  "salary": 65000,
  "hireDate": "2023-02-01",
  "emergencyContact": {
    "name": "Bob Smith",
    "relationship": "Spouse",
    "phone": "+1234567892"
  },
  "skills": ["Digital Marketing", "SEO", "Content Strategy"],
  "notes": "Creative and strategic thinker"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_employee_id",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    // ... other fields
  }
}
```

### Update Employee
```http
PUT /api/employees/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": "Senior Marketing Manager",
  "salary": 70000,
  "department": "Marketing",
  "skills": ["Digital Marketing", "SEO", "Content Strategy", "Team Leadership"]
}
```

### Delete Employee
```http
DELETE /api/employees/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### Get Employee Statistics
```http
GET /api/employees/stats/overview
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 25,
    "activeEmployees": 23,
    "inactiveEmployees": 2,
    "employeesByDepartment": {
      "Engineering": 10,
      "Marketing": 5,
      "HR": 3,
      "Sales": 4,
      "Design": 3
    },
    "newHiresThisMonth": 2,
    "avgSalary": 65000,
    "topSkills": [
      "JavaScript",
      "React",
      "Python",
      "Project Management",
      "Marketing"
    ]
  }
}
```

### Search Employees
```http
GET /api/employees/search?q=john&department=Engineering
Authorization: Bearer <token>
```

---

## 📊 Attendance Management

### Clock In
```http
POST /api/attendance/clock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": {
    "coordinates": [-73.935242, 40.730610],
    "address": "123 Main St, New York, NY"
  },
  "ipAddress": "192.168.1.100",
  "deviceInfo": "Chrome/91.0 on Windows 10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attendance_id",
    "employee": "user_id",
    "date": "2023-12-07",
    "clockIn": "2023-12-07T09:00:00.000Z",
    "clockOut": null,
    "totalHours": null,
    "status": "present",
    "location": {
      "coordinates": [-73.935242, 40.730610],
      "address": "123 Main St, New York, NY"
    }
  }
}
```

### Clock Out
```http
POST /api/attendance/clock-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": {
    "coordinates": [-73.935242, 40.730610],
    "address": "123 Main St, New York, NY"
  },
  "notes": "Completed project milestone"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attendance_id",
    "employee": "user_id",
    "date": "2023-12-07",
    "clockIn": "2023-12-07T09:00:00.000Z",
    "clockOut": "2023-12-07T17:30:00.000Z",
    "totalHours": 8.5,
    "status": "present",
    "notes": "Completed project milestone"
  }
}
```

### Get My Attendance
```http
GET /api/attendance/my-attendance
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Number of records (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "attendance_id",
      "date": "2023-12-07",
      "clockIn": "2023-12-07T09:00:00.000Z",
      "clockOut": "2023-12-07T17:30:00.000Z",
      "totalHours": 8.5,
      "status": "present",
      "location": {
        "coordinates": [-73.935242, 40.730610],
        "address": "123 Main St, New York, NY"
      }
    }
  ]
}
```

### Get Employee Attendance
```http
GET /api/attendance/employee/{id}
Authorization: Bearer <token>
```

### Get All Attendance (Admin/HR)
```http
GET /api/attendance/all
Authorization: Bearer <token>
```

### Approve Attendance
```http
PUT /api/attendance/{id}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approvedBy": "hr_manager_id",
  "notes": "Approved - valid reason provided"
}
```

### Update Attendance
```http
PUT /api/attendance/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "clockIn": "2023-12-07T09:15:00.000Z",
  "clockOut": "2023-12-07T17:45:00.000Z",
  "status": "present",
  "notes": "Late arrival due to traffic"
}
```

### Get Attendance Statistics
```http
GET /api/attendance/stats/overview
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAttendanceRecords": 150,
    "presentToday": 23,
    "absentToday": 2,
    "lateToday": 1,
    "avgHoursPerDay": 8.2,
    "totalHoursThisMonth": 1840,
    "topPerformers": [
      {
        "employeeId": "EMP001",
        "name": "John Doe",
        "totalHours": 160,
        "avgHoursPerDay": 8.5
      }
    ]
  }
}
```

### Get Current Status
```http
GET /api/attendance/current-status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isClockedIn": true,
    "currentSession": {
      "id": "attendance_id",
      "clockIn": "2023-12-07T09:00:00.000Z",
      "elapsedTime": "02:30:15"
    }
  }
}
```

---

## 🔐 User Management

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Get All Users (Admin)
```http
GET /api/auth/users
Authorization: Bearer <token>
```

### Register User (Admin)
```http
POST /api/auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "password": "securepassword123",
  "role": "employee",
  "employeeId": "EMP003"
}
```

---

## 🛠️ Utility Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2023-12-07T12:00:00.000Z",
  "uptime": "2 days, 4 hours",
  "version": "1.0.0"
}
```

---

## 📝 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully" // optional
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request data |
| `UNAUTHORIZED` | Authentication required or invalid |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `SERVER_ERROR` | Internal server error |

---

## 📊 Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload**: 10 requests per minute

---

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers
- **Role-based Access**: Granular permission control

---

## 🧪 Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Get employees (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer TOKEN"

# Clock in
curl -X POST http://localhost:5000/api/attendance/clock-in \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "coordinates": [-73.935242, 40.730610]
    }
  }'
```

### Using Postman

1. Import the API endpoints
2. Set the base URL to `http://localhost:5000/api`
3. Add the Authorization header with Bearer token
4. Test each endpoint with appropriate request bodies

---

## 📈 Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Use HTTPS in production** for secure communication
3. **Validate input data** on both client and server side
4. **Handle errors gracefully** with proper error messages
5. **Use pagination** for large datasets
6. **Cache frequently accessed data** when possible
7. **Log API usage** for monitoring and debugging
8. **Follow REST conventions** for consistent API design

---

## 🤝 Need Help?

- Check the [main README](../README.md) for setup instructions
- Review the [frontend documentation](../ems-frontend/README.md) for client-side integration
- Check the browser network tab for failed requests
- Verify JWT tokens are valid and not expired
- Ensure proper role permissions for restricted endpoints

---

**Happy API development! 🚀**
