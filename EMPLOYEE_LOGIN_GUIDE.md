# 🔐 Employee Login System - Complete Guide

## ✅ System Overview

When an admin adds an employee, the system now:
1. ✅ **Stores employee data** in `employees` table
2. ✅ **Creates user account** in `users` table with hashed password
3. ✅ **Employee can immediately log in** with their credentials
4. ✅ **Returns credentials** to admin for sharing with employee

---

## 📊 Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Admin Adds Employee                                    │
│  ────────────────────────────────────────────────────────────── │
│  POST /api/employees                                            │
│  {                                                              │
│    "firstName": "John",                                         │
│    "lastName": "Doe",                                           │
│    "email": "john.doe@company.com",                             │
│    "department": "Engineering",                                 │
│    "position": "Developer",                                     │
│    "username": "john.doe",         ← NEW: Login username       │
│    "password": "password123",      ← NEW: Login password       │
│    "role": "employee"              ← Optional (default employee)│
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: System Creates Records                                 │
│  ────────────────────────────────────────────────────────────── │
│  ✅ Insert into `employees` table:                              │
│     - Employee profile data                                     │
│     - Auto-generated employeeId (e.g., EMP1727871852456)        │
│                                                                 │
│  ✅ Insert into `users` table:                                  │
│     - username: "john.doe"                                      │
│     - email: "john.doe@company.com"                             │
│     - password: (hashed with bcrypt)                            │
│     - role: "employee"                                          │
│     - employeeId: "EMP1727871852456" (links to employee)        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: System Returns Credentials                             │
│  ────────────────────────────────────────────────────────────── │
│  {                                                              │
│    "success": true,                                             │
│    "message": "Employee added successfully and user account     │
│                created",                                        │
│    "data": { ... employee details ... },                        │
│    "credentials": {                                             │
│      "username": "john.doe",                                    │
│      "temporaryPassword": "password123",                        │
│      "message": "Share these credentials with the employee"     │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Admin Shares Credentials with Employee                 │
│  ────────────────────────────────────────────────────────────── │
│  Admin gives employee:                                          │
│  - Username: john.doe                                           │
│  - Password: password123                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Employee Logs In                                       │
│  ────────────────────────────────────────────────────────────── │
│  POST /api/auth/login                                           │
│  {                                                              │
│    "username": "john.doe",  ← or email: "john.doe@company.com" │
│    "password": "password123"                                    │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: System Authenticates                                   │
│  ────────────────────────────────────────────────────────────── │
│  1. Check demo users (admin, hr, employee) - NOT FOUND          │
│  2. Check database `users` table - FOUND ✅                     │
│  3. Verify password using password_verify() - MATCH ✅          │
│  4. Generate JWT token                                          │
│  5. Return user data and token                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: Employee Authenticated!                                │
│  ────────────────────────────────────────────────────────────── │
│  {                                                              │
│    "success": true,                                             │
│    "token": "eyJ1c2VybmFtZSI6ImpvaG4uZG9lIi...",                │
│    "user": {                                                    │
│      "username": "john.doe",                                    │
│      "role": "employee",                                        │
│      "employeeId": "EMP1727871852456",                          │
│      "email": "john.doe@company.com"                            │
│    },                                                           │
│    "message": "Login successful"                                │
│  }                                                              │
│                                                                 │
│  ✅ Employee can now access the system!                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Table: `employees`
```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId VARCHAR(50) UNIQUE NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    hireDate DATE,
    salary DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    address TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Table: `users` (NEW)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,              -- bcrypt hashed
    role VARCHAR(20) DEFAULT 'employee',         -- employee, hr, admin
    employeeId VARCHAR(50) UNIQUE NOT NULL,      -- links to employees table
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
)
```

---

## 🧪 Testing Guide

### Method 1: Visual Tester (Recommended)

1. **Open the tester**:
   ```
   http://localhost/EMS/ems-backend-php/test-employee-api.html
   ```

2. **Login as Admin**:
   - Click "Login as Admin"
   - Status changes to "Logged in as admin" ✅

3. **Add New Employee**:
   - Fill in the form (or click "Generate Random Data")
   - **Important fields**:
     - Username: `john.doe` (for login)
     - Password: `password123` (min 6 characters)
     - Role: Employee or HR
   - Click "Add Employee"
   - Response shows: "Employee added successfully and user account created" ✅
   - Note the credentials in the response

4. **Test Employee Login**:
   - Scroll to "4. Test Employee Login" section
   - Enter the username and password you just created
   - Click "Test Employee Login"
   - Should show: "Login successful" ✅

5. **Verify in List**:
   - Click "Get All Employees"
   - The new employee appears in the list ✅

---

### Method 2: Manual API Testing

#### Step 1: Admin Login
```bash
curl -X POST http://localhost/EMS/ems-backend-php/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
Copy the `token` from response.

#### Step 2: Add Employee with Credentials
```bash
curl -X POST http://localhost/EMS/ems-backend-php/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "department": "Marketing",
    "position": "Marketing Manager",
    "username": "jane.smith",
    "password": "password123",
    "role": "employee",
    "salary": 65000
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Employee added successfully and user account created",
  "data": {
    "id": 1,
    "employeeId": "EMP1727871852456",
    "firstName": "Jane",
    ...
  },
  "credentials": {
    "username": "jane.smith",
    "temporaryPassword": "password123",
    "message": "Share these credentials with the employee"
  }
}
```

#### Step 3: Employee Login
```bash
curl -X POST http://localhost/EMS/ems-backend-php/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jane.smith","password":"password123"}'
```

**Success Response:**
```json
{
  "success": true,
  "token": "eyJ1c2VybmFtZSI6ImphbmUuc21pdGgiLCJyb2xlIjoiZW1wbG95ZWUi...",
  "user": {
    "username": "jane.smith",
    "role": "employee",
    "employeeId": "EMP1727871852456",
    "email": "jane.smith@company.com"
  },
  "message": "Login successful"
}
```

✅ **Employee can now use this token to access the system!**

---

## 🔒 Security Features

### Password Hashing
- ✅ Passwords are **never stored in plain text**
- ✅ Uses PHP `password_hash()` with `PASSWORD_DEFAULT` (bcrypt)
- ✅ Verified with `password_verify()` during login

### Login Flexibility
- ✅ Employees can login with **username** OR **email**
- ✅ System checks both fields in the database

### Validation
- ✅ Username required (unique)
- ✅ Password minimum 6 characters
- ✅ Email format validation
- ✅ Duplicate username/email prevention

### Database Integrity
- ✅ Foreign key constraint links users to employees
- ✅ Cascade delete: if employee is deleted, user account is too
- ✅ Transaction-like behavior: if user creation fails, employee is rolled back

---

## 📋 Required Fields for Adding Employee

| Field | Type | Required | Purpose | Example |
|-------|------|----------|---------|---------|
| firstName | string | ✅ Yes | Employee's first name | "John" |
| lastName | string | ✅ Yes | Employee's last name | "Doe" |
| email | string | ✅ Yes | Email & alternative login | "john.doe@company.com" |
| department | string | ✅ Yes | Department | "Engineering" |
| position | string | ✅ Yes | Job title | "Software Developer" |
| **username** | string | ✅ **Yes** | **Login username** | **"john.doe"** |
| **password** | string | ✅ **Yes** | **Login password (min 6 chars)** | **"password123"** |
| role | string | ❌ No | User role (default: employee) | "employee", "hr" |
| phone | string | ❌ No | Phone number | "+1-555-0123" |
| salary | number | ❌ No | Salary | 75000 |
| hireDate | date | ❌ No | Hire date | "2025-10-02" |
| address | string | ❌ No | Address | "123 Main St" |

---

## 🎯 Use Cases

### Use Case 1: Add Regular Employee
```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@company.com",
  "department": "Sales",
  "position": "Sales Representative",
  "username": "alice.johnson",
  "password": "welcome123",
  "role": "employee"
}
```
✅ Alice can login and view her data, but cannot add other employees.

### Use Case 2: Add HR Manager
```json
{
  "firstName": "Bob",
  "lastName": "Wilson",
  "email": "bob.wilson@company.com",
  "department": "HR",
  "position": "HR Manager",
  "username": "bob.wilson",
  "password": "hr2024pass",
  "role": "hr"
}
```
✅ Bob can login AND add new employees (same as admin).

---

## 🔍 Verification

### Check Database in phpMyAdmin
1. Open: `http://localhost/phpmyadmin`
2. Database: `ems`
3. **Table: `employees`** - See employee records
4. **Table: `users`** - See user accounts with hashed passwords

### Example `users` table data:
| id | username | email | password | role | employeeId | isActive |
|----|----------|-------|----------|------|------------|----------|
| 1 | jane.smith | jane.smith@company.com | $2y$10$... | employee | EMP1727871852456 | 1 |
| 2 | bob.wilson | bob.wilson@company.com | $2y$10$... | hr | EMP1727871923789 | 1 |

Notice the password is hashed (starts with `$2y$10$`)

---

## ⚠️ Error Handling

### "Username already exists"
```json
{
  "error": "Username already exists"
}
```
**Solution**: Choose a different username

### "Employee with this email already exists"
```json
{
  "error": "Employee with this email already exists"
}
```
**Solution**: Use a different email address

### "Password must be at least 6 characters"
```json
{
  "error": "Password must be at least 6 characters"
}
```
**Solution**: Use a longer password

### "Invalid credentials" (during login)
```json
{
  "error": "Invalid credentials"
}
```
**Solution**: Check username and password are correct

---

## 🎉 Summary

✅ **What's Implemented:**
1. Admin adds employee with username & password
2. System creates employee record in database
3. System creates user account with hashed password
4. Employee can immediately log in with credentials
5. Login works with username OR email
6. Passwords are securely hashed (bcrypt)
7. Role-based access (employee, hr, admin)
8. Complete validation and error handling

✅ **Test It Now:**
```
http://localhost/EMS/ems-backend-php/test-employee-api.html
```

**Everything is ready! 🚀**
