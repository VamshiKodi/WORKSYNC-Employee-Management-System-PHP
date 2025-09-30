# EMS Frontend - Employee Management System

A modern React-based frontend application for the Employee Management System, built with TypeScript and featuring a responsive design for comprehensive employee and attendance management.

## Features

### User Interface
- **Modern Dashboard** - Clean, intuitive interface with role-based navigation
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme** - Toggle between themes for better user experience
- **Real-time Updates** - Live data synchronization with the backend

### Employee Management
- **Employee Directory** - Search, filter, and manage employee profiles
- **Profile Management** - View and edit complete employee information
- **Bulk Operations** - Import/export employee data
- **Advanced Search** - Filter by department, position, status, and more

### Attendance System
- **Clock In/Out Interface** - Easy-to-use time tracking interface
- **Attendance History** - View personal and team attendance records
- **Location Tracking** - GPS-based location recording for remote work
- **Attendance Reports** - Generate and export attendance reports

### Authentication & Security
- **Secure Login** - JWT-based authentication with role validation
- **Session Management** - Automatic logout and session handling
- **Password Security** - Secure password change functionality
- **Access Control** - Role-based feature access and permissions

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Create React App
- **Language**: TypeScript for type safety
- **Styling**: CSS Modules with responsive design
- **HTTP Client**: Axios for API communication
- **State Management**: React Context API
- **Icons**: React Icons
- **Date Handling**: date-fns
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- EMS Backend API running on port 5000

## Installation & Setup

### 1. Install Dependencies

```bash
cd ems-frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### 3. Start the Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `build/` directory.

## Project Structure

```
ems-frontend/
├── public/                  # Static assets
│   ├── index.html          # Main HTML template
│   └── favicon.ico         # Application icon
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Shared components (Button, Input, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── employees/      # Employee-related components
│   │   └── attendance/     # Attendance-related components
│   ├── pages/              # Page components
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Employees/      # Employee management pages
│   │   ├── Attendance/     # Attendance pages
│   │   ├── Profile/        # User profile pages
│   │   └── Auth/           # Authentication pages
│   ├── services/           # API service functions
│   │   ├── api.ts          # API configuration
│   │   ├── auth.ts         # Authentication services
│   │   ├── employees.ts    # Employee services
│   │   └──attendance.ts   # Attendance services
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── ThemeContext.tsx # Theme context
│   ├── utils/              # Helper functions
│   │   ├── constants.ts    # Application constants
│   │   ├── helpers.ts      # Utility functions
│   │   └── validation.ts   # Form validation helpers
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Main type exports
│   │   ├── auth.ts         # Authentication types
│   │   ├── employee.ts     # Employee types
│   │   └──attendance.ts   # Attendance types
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Application entry point
│   └── setupTests.ts       # Test configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Available Scripts

### `npm start`
Runs the app in development mode with hot reload.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

Removes the single build dependency and copies all configuration files so you have full control over them.

## Styling and Themes

The application uses CSS Modules for component-scoped styling:

- **Design System** - Consistent colors, typography, and spacing
- **Responsive Layout** - Mobile-first responsive design
- **Theme Support** - Dark and light theme options
- **Component Library** - Reusable styled components

## API Integration

The frontend communicates with the backend API through typed service functions:

```typescript
// Example API call
import { employeeService } from '../services/employees';

const fetchEmployees = async () => {
  try {
    const response = await employeeService.getAll();
    setEmployees(response.data);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  }
};
```

## Authentication Flow

1. **Login** - User submits credentials
2. **Token Storage** - JWT token stored in localStorage
3. **API Requests** - Token automatically included in headers
4. **Role Validation** - Components render based on user roles
5. **Auto Logout** - Session expires after inactivity

## Responsive Design

The application is fully responsive with breakpoints for:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Build the application
2. Deploy the `build/` folder to your hosting platform
3. Set environment variables in your hosting platform

### Environment Variables for Deployment
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENVIRONMENT=production
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful component and function names
- Add JSDoc comments for complex functions

### Component Structure
```typescript
interface Props {
  // Define props
}

const ComponentName: React.FC<Props> = ({ propName }) => {
  // Component logic

  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### State Management
- Use React Context for global state
- Use useState for local component state
- Use useReducer for complex state logic

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Performance Optimization

- **Code Splitting** - Automatic route-based code splitting
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Optimized images with lazy loading
- **Bundle Analysis** - Webpack bundle analyzer for optimization

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend server is running on port 5000
   - Check REACT_APP_API_URL in .env file

2. **Authentication Issues**
   - Clear localStorage and login again
   - Check JWT token expiration

3. **Build Errors**
   - Delete node_modules and run `npm install`
   - Clear npm cache with `npm cache clean --force`

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the browser console for errors
- Verify the backend API is accessible
- Ensure environment variables are set correctly
- Check network tab for failed API requests

---

**Happy coding! 🎉**
