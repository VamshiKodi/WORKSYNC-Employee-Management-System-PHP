# 🚀 Quick Start Guide - Employee Management System

## ✅ What's Been Set Up

### 1. **Admin Credentials** ✅
- **Username**: `admin`
- **Password**: `admin123`

### 2. **Employee Management API** ✅
- ✅ Add new employees (Admin/HR only)
- ✅ View all employees
- ✅ Auto-creates MySQL database table
- ✅ Success message: "Employee added successfully"
- ✅ Stores data in MySQL `ems` database

---

## 🎯 Quick Test (3 Easy Steps)

### **Option 1: Use the Visual Tester (Recommended)**

1. **Open in browser**:
   ```
   http://localhost/EMS/ems-backend-php/test-employee-api.html
   ```

2. **Click "Login as Admin"** - You'll see "Logged in as admin"

3. **Click "Add Employee"** - You'll see "Employee added successfully"

**That's it!** 🎉

---

### **Option 2: Use Postman/API Client**

#### Step 1: Login
```http
POST http://localhost/EMS/ems-backend-php/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Copy the `token` from response**

#### Step 2: Add Employee
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
  "salary": 75000
}
```

**Response**:
```json
{
  "success": true,
  "message": "Employee added successfully",
  "data": { ... employee details ... }
}
```

---

## 📋 All Available Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/login` | POST | ❌ No | Login to get token |
| `/api/auth/me` | GET | ✅ Yes | Get current user info |
| `/api/employees` | POST | ✅ Yes (Admin/HR) | Add new employee |
| `/api/employees` | GET | ✅ Yes | Get all employees |
| `/api/health` | GET | ❌ No | Check API status |

---

## 🔑 Default Accounts

| Username | Password | Role | Can Add Employees |
|----------|----------|------|-------------------|
| admin | admin123 | Admin | ✅ Yes |
| hr | hr123 | HR | ✅ Yes |
| employee | employee123 | Employee | ❌ No (view only) |

---

## 📁 Files Created/Modified

### Created:
- ✅ `CREDENTIALS.md` - Login credentials reference
- ✅ `API_TESTING_GUIDE.md` - Detailed API documentation
- ✅ `test-employee-api.html` - Visual API tester
- ✅ `QUICK_START.md` - This file

### Modified:
- ✅ `c:\xampp\htdocs\index.php` - Fixed routing bug
- ✅ `c:\xampp\htdocs\EMS\ems-backend-php\index.php` - Added employee endpoints

---

## 🗄️ Database Details

- **Database Name**: `ems`
- **Table**: `employees` (auto-created on first employee add)
- **Auto-generated fields**:
  - `employeeId` (e.g., "EMP1727803162456")
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

---

## 🎨 Testing Interface Features

The `test-employee-api.html` page includes:
- ✅ One-click admin login
- ✅ Beautiful form to add employees
- ✅ Random employee data generator
- ✅ Real-time response display
- ✅ Color-coded success/error messages
- ✅ Token display and management

---

## ⚠️ Prerequisites

1. **XAMPP must be running**:
   - ✅ Apache (green)
   - ✅ MySQL (green)

2. **Database exists**:
   - Database name: `ems`
   - The system will auto-create tables

---

## 🐛 Troubleshooting

### "Database not available"
```bash
# Solution: Start MySQL in XAMPP Control Panel
```

### "Authentication required"
```bash
# Solution: Login first to get a token
```

### "Permission denied"
```bash
# Solution: Login as admin or hr (not regular employee)
```

### "Employee with this email already exists"
```bash
# Solution: Use a different email address
```

---

## 📸 Expected Success Message

When you add an employee, you'll see:

```json
{
  "success": true,
  "message": "Employee added successfully",
  "data": {
    "id": 1,
    "employeeId": "EMP1727803162789",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "department": "Engineering",
    "position": "Software Developer",
    "salary": "75000.00",
    "status": "active",
    "createdAt": "2025-10-01 22:19:22",
    "updatedAt": "2025-10-01 22:19:22"
  }
}
```

---

## 🎉 Next Steps

1. **Test the API** using the HTML tester
2. **Integrate with your frontend** using the documented endpoints
3. **Add more features** like:
   - Update employee
   - Delete employee
   - Search/filter employees
   - Employee profiles with photos

---

## 📞 API Base URL

```
http://localhost/EMS/ems-backend-php
```

All endpoints are prefixed with `/api/`

Example: `http://localhost/EMS/ems-backend-php/api/employees`

---

**Everything is ready! Start testing now! 🚀**

Open: `http://localhost/EMS/ems-backend-php/test-employee-api.html`
