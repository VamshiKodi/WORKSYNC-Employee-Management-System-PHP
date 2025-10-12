# Default Login Credentials

## 🔐 Pre-configured Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin
- **Employee ID**: EMP001
- **Permissions**: Can add/view employees

### HR Account
- **Username**: `hr`
- **Password**: `hr123`
- **Role**: HR
- **Employee ID**: EMP003
- **Permissions**: Can add/view employees

### Demo Employee Account
- **Username**: `employee`
- **Password**: `employee123`
- **Role**: Employee
- **Employee ID**: EMP002
- **Permissions**: Can view employees only

---

## 👥 Employee Accounts (Created by Admin)

When admin adds a new employee, they provide:
- **Username**: Chosen by admin (e.g., `john.doe`)
- **Password**: Set by admin (min 6 characters)
- **Role**: employee or hr

**Example**:
- Username: `john.doe`
- Password: `password123`
- Role: employee

These credentials are stored in the database and the employee can log in immediately!

---

## Testing Login

### Using cURL
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Using Postman or Frontend
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJ...",
  "user": {
    "username": "admin",
    "role": "admin",
    "employeeId": "EMP001",
    "email": "admin@company.com"
  },
  "message": "Login successful"
}
```

---

**Note**: These are demo credentials. For production, implement proper user management with database-backed authentication.
