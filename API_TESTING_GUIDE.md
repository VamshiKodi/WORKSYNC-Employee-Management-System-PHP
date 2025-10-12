# API Testing Guide - Employee Management System

## Prerequisites
1. **Start XAMPP**: Make sure Apache and MySQL are running in XAMPP Control Panel
2. **Database**: The system will automatically create the `employees` table on first employee creation

---

## Step 1: Admin Login

### Request
```http
POST http://localhost/EMS/ems-backend-php/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZW1wbG95ZWVJZCI6IkVNUDAwMSIsImlhdCI6MTY5Nzg...",
  "user": {
    "username": "admin",
    "role": "admin",
    "employeeId": "EMP001",
    "email": "admin@company.com"
  },
  "message": "Login successful"
}
```

**Important**: Copy the `token` value from the response. You'll need it for the next steps!

---

## Step 2: Add New Employee (Admin Only)

### Request
```http
POST http://localhost/EMS/ems-backend-php/api/employees
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "department": "Engineering",
  "position": "Software Developer",
  "phone": "+1-555-0123",
  "salary": 75000,
  "hireDate": "2025-10-01",
  "address": "123 Main St, City, State"
}
```

**Replace `YOUR_TOKEN_HERE` with the actual token from Step 1**

### Success Response
```json
{
  "success": true,
  "message": "Employee added successfully",
  "data": {
    "id": 1,
    "employeeId": "EMP1727803162456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-0123",
    "department": "Engineering",
    "position": "Software Developer",
    "hireDate": "2025-10-01",
    "salary": "75000.00",
    "status": "active",
    "address": "123 Main St, City, State",
    "createdAt": "2025-10-01 22:19:22",
    "updatedAt": "2025-10-01 22:19:22"
  }
}
```

---

## Step 3: Get All Employees

### Request
```http
GET http://localhost/EMS/ems-backend-php/api/employees
Authorization: Bearer YOUR_TOKEN_HERE
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": "EMP1727803162456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "position": "Software Developer",
      "status": "active",
      ...
    }
  ],
  "count": 1
}
```

---

## Testing with cURL (Command Line)

### 1. Login and get token
```bash
curl -X POST http://localhost/EMS/ems-backend-php/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### 2. Add employee (replace TOKEN with actual token)
```bash
curl -X POST http://localhost/EMS/ems-backend-php/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"email\":\"jane.smith@company.com\",\"department\":\"HR\",\"position\":\"HR Manager\",\"salary\":65000}"
```

### 3. Get all employees
```bash
curl -X GET http://localhost/EMS/ems-backend-php/api/employees \
  -H "Authorization: Bearer TOKEN"
```

---

## Testing with Postman

1. **Import as Collection**: Create a new collection in Postman
2. **Set Base URL**: Use `http://localhost/EMS/ems-backend-php`
3. **Login Request**:
   - Method: `POST`
   - URL: `{{baseUrl}}/api/auth/login`
   - Body: Raw JSON with admin credentials
   - Save the token from response
4. **Add Environment Variable**: Create a variable `authToken` and paste the token
5. **Add Employee Request**:
   - Method: `POST`
   - URL: `{{baseUrl}}/api/employees`
   - Headers: `Authorization: Bearer {{authToken}}`
   - Body: Employee data as JSON

---

## Required Fields for Employee

| Field | Type | Required | Example |
|-------|------|----------|---------|
| firstName | string | ✅ Yes | "John" |
| lastName | string | ✅ Yes | "Doe" |
| email | string | ✅ Yes | "john@company.com" |
| department | string | ✅ Yes | "Engineering" |
| position | string | ✅ Yes | "Developer" |
| phone | string | ❌ No | "+1-555-0123" |
| salary | number | ❌ No | 75000 |
| hireDate | date | ❌ No | "2025-10-01" |
| address | string | ❌ No | "123 Main St" |

---

## Error Responses

### Missing Required Field
```json
{
  "error": "Email is required"
}
```

### Duplicate Email
```json
{
  "error": "Employee with this email already exists"
}
```

### Permission Denied (Non-Admin User)
```json
{
  "error": "Permission denied. Only admin and HR can add employees."
}
```

### Invalid/Expired Token
```json
{
  "error": "Invalid or expired token"
}
```

### No Authentication
```json
{
  "error": "Authentication required"
}
```

---

## Permissions

| Role | Can Add Employees | Can View Employees |
|------|-------------------|-------------------|
| Admin | ✅ Yes | ✅ Yes |
| HR | ✅ Yes | ✅ Yes |
| Employee | ❌ No | ✅ Yes |

---

## Database Information

- **Database**: `ems` (MySQL)
- **Table**: `employees` (auto-created on first employee add)
- **Auto-generated**: `employeeId`, `createdAt`, `updatedAt`
- **Default values**: `status = 'active'`, `salary = 0`

---

## Sample Employee Data for Testing

```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@company.com",
  "department": "Marketing",
  "position": "Marketing Manager",
  "phone": "+1-555-0456",
  "salary": 68000,
  "hireDate": "2025-09-15",
  "address": "456 Oak Ave, City, State"
}
```

```json
{
  "firstName": "Michael",
  "lastName": "Chen",
  "email": "michael.chen@company.com",
  "department": "Engineering",
  "position": "Senior Developer",
  "phone": "+1-555-0789",
  "salary": 85000,
  "hireDate": "2024-03-10",
  "address": "789 Pine Rd, City, State"
}
```

---

## Troubleshooting

### "Database not available"
- ✅ Start MySQL in XAMPP Control Panel
- ✅ Check database name is `ems`
- ✅ Verify MySQL is running on port 3306

### "Authentication required"
- ✅ Include `Authorization: Bearer TOKEN` header
- ✅ Token should not be expired (valid for 24 hours)
- ✅ Format: `Bearer` + space + token

### "Permission denied"
- ✅ Login as `admin` or `hr` user
- ✅ Regular employees cannot add employees

### Token expired
- ✅ Login again to get a fresh token
- ✅ Tokens expire after 24 hours

---

**Happy Testing! 🚀**
