Hmmm… can't reach this page
localhost refused to connect.
Try:

Checking the connection
Checking the proxy and the firewall
ERR_CONNECTION_REFUSED

# 🚀 EMS - Employee Management System

A comprehensive full-stack Employee Management System built with Node.js, Express, MongoDB, and React. This system provides complete employee lifecycle management with authentication, attendance tracking, and role-based access control.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** - Secure token-based login system
- **Role-based Access Control** - Admin, HR, and Employee roles
- **Password Security** - bcrypt hashing with salt rounds
- **Session Management** - Automatic token refresh and validation

### 👥 Employee Management
- **Complete CRUD Operations** - Create, read, update, delete employee profiles
- **Advanced Search & Filtering** - Search by name, department, position, etc.
- **Employee Statistics** - Dashboard with employee metrics and analytics
- **Profile Management** - Comprehensive employee information management

### 📊 Attendance Tracking
- **Clock In/Out System** - Real-time attendance tracking
- **Location Tracking** - GPS-based location recording
- **Attendance Reports** - Detailed attendance history and analytics
- **Status Management** - Present, absent, late, half-day tracking
- **Approval System** - HR/Admin approval for attendance records

### 🔄 Additional Features
- **Leave Management** - Request and approve leave applications
- **Payroll Integration** - Salary and compensation management
- **Performance Tracking** - Employee performance evaluation
- **Document Management** - File upload and storage system
- **Audit Logs** - Complete activity tracking and logging

## 🛠️ Tech Stack

### Backend (ems-backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator

### Frontend (ems-frontend)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Create React App
- **UI Library**: Custom components with CSS modules
- **State Management**: React Context API
- **HTTP Client**: Axios

### Development Tools
- **Version Control**: Git
- **Package Managers**: npm
- **Code Quality**: ESLint, Prettier
- **Documentation**: Markdown, JSDoc

## 📁 Project Structure

```
EMS/
├── ems-backend/              # Backend API server
│   ├── config/              # Database configuration
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API route handlers
│   ├── scripts/             # Database seeding scripts
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
├── ems-frontend/            # React frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   ├── build/               # Production build
│   └── package.json         # Frontend dependencies
├── docs/                    # Documentation (to be created)
├── README.md               # This file
└── package.json            # Root package.json (optional)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd EMS
   ```

2. **Setup Backend**
   ```bash
   cd ems-backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run seed
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../ems-frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs

### Demo Credentials
- **Admin**: `admin` / `admin123`
- **HR Manager**: `hr_manager` / `hr123`
- **Employee**: `john.doe` / `emp123`

## 📖 API Documentation

The backend API provides comprehensive REST endpoints for all features:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user profile

### Employee Management
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance Tracking
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/my-attendance` - Get own attendance

For detailed API documentation, visit `/api/docs` when the server is running.

## 💻 Development

### Development Setup

1. **Environment Variables**
   Create `.env` files in both backend and frontend directories:

   ```env
   # Backend .env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ems
   JWT_SECRET=your-secret-key
   ```

2. **Database Seeding**
   ```bash
   cd ems-backend
   npm run seed
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd ems-backend
   npm run dev

   # Terminal 2 - Frontend
   cd ems-frontend
   npm start
   ```

### Code Structure

#### Backend Structure
```
ems-backend/
├── config/          # Database and app configuration
├── middleware/      # Authentication and validation middleware
├── models/          # Mongoose data models
├── routes/          # API route definitions
├── scripts/         # Database seeding and utilities
└── server.js        # Application entry point
```

#### Frontend Structure
```
ems-frontend/src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── services/       # API service functions
├── context/        # React context providers
├── utils/          # Helper functions
└── App.js          # Main application component
```

## 🚢 Deployment

### Production Build

1. **Backend Build**
   ```bash
   cd ems-backend
   npm run build
   npm start
   ```

2. **Frontend Build**
   ```bash
   cd ems-frontend
   npm run build
   # Deploy the build/ folder to your web server
   ```

### Environment Configuration (Production)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ems
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://yourdomain.com
```

### Deployment Platforms

- **Backend**: Heroku, DigitalOcean, AWS EC2, Railway
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for functions
- Update README for new features
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Issues](../../issues) page
2. Review the API documentation at `/api/docs`
3. Check the browser console for frontend errors
4. Verify MongoDB connection and environment variables
5. Ensure both backend and frontend servers are running

## 🔄 Roadmap

### Phase 1 (Current) ✅
- User authentication and authorization
- Employee CRUD operations
- Basic attendance tracking

### Phase 2 (In Development)
- Leave management system
- Payroll integration
- Advanced reporting

### Phase 3 (Future)
- Mobile application
- Advanced analytics
- Multi-tenant support

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- UI components inspired by modern design systems
- Database modeling with [Mongoose](https://mongoosejs.com/)
- Authentication powered by [JWT.io](https://jwt.io/)

---

**Happy coding! 🎉**
