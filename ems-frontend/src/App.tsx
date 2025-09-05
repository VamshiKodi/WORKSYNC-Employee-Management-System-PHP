import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import './styles/modern-corporate-colors.css';
import './styles/fonts.css';
import ModernCorporateColors from './styles/modern-corporate-colors';

// Import components
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import Dashboard from './components/Dashboard';
import ModernCorporateDemo from './components/ModernCorporateDemo';
import { AuthProvider } from './contexts/AuthContext';
// New feature imports
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import ActivityFeed from './components/ActivityFeed';
import Profile from './components/Profile';
import LeaveRequests from './components/LeaveRequests';
import RoleManagement from './components/RoleManagement';
import BulkCSV from './components/BulkCSV';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import TestingAccessibility from './components/TestingAccessibility';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: ModernCorporateColors.navyBlue,
      light: ModernCorporateColors.navyBlueLight,
      dark: ModernCorporateColors.navyBlueDark,
      contrastText: ModernCorporateColors.white,
    },
    secondary: {
      main: ModernCorporateColors.tealAccent,
      light: ModernCorporateColors.tealAccentLight,
      dark: ModernCorporateColors.tealAccentDark,
      contrastText: ModernCorporateColors.white,
    },
    background: {
      default: ModernCorporateColors.lightGray,
      paper: ModernCorporateColors.white,
    },
    text: {
      primary: ModernCorporateColors.slateGray,
      secondary: ModernCorporateColors.slateGrayLight,
    },
    divider: ModernCorporateColors.lightGrayDark,
    success: {
      main: ModernCorporateColors.success,
    },
    warning: {
      main: ModernCorporateColors.warning,
    },
    error: {
      main: ModernCorporateColors.error,
    },
    info: {
      main: ModernCorporateColors.info,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 800,
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
      color: ModernCorporateColors.blueGradient1,
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
      color: ModernCorporateColors.blueGradient1,
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 600,
      fontSize: '2rem',
      color: ModernCorporateColors.blueGradient1,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      color: ModernCorporateColors.blueGradient1,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      color: ModernCorporateColors.blueGradient1,
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h6: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      color: ModernCorporateColors.blueGradient1,
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
      color: ModernCorporateColors.slateGray,
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: ModernCorporateColors.slateGrayLight,
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.5px',
      fontSize: '0.875rem',
    },
    caption: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: ModernCorporateColors.slateGrayLight,
      fontWeight: 400,
    },
    overline: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: ModernCorporateColors.slateGrayLight,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 32px',
          boxShadow: 'none',
          border: '2px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(3, 4, 94, 0.15)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${ModernCorporateColors.blueGradient1} 0%, ${ModernCorporateColors.blueGradient3} 100%)`,
          color: ModernCorporateColors.white,
          '&:hover': {
            background: `linear-gradient(135deg, ${ModernCorporateColors.blueGradient3} 0%, ${ModernCorporateColors.blueGradient1} 100%)`,
          },
        },
        outlined: {
          borderColor: ModernCorporateColors.blueGradient1,
          color: ModernCorporateColors.blueGradient1,
          '&:hover': {
            borderColor: ModernCorporateColors.blueGradient3,
            backgroundColor: ModernCorporateColors.navyBlue10,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: `0 4px 20px ${ModernCorporateColors.navyBlue20}`,
          border: `1px solid ${ModernCorporateColors.lightGrayDark}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px ${ModernCorporateColors.navyBlue20}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: `0 4px 20px ${ModernCorporateColors.navyBlue20}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: ModernCorporateColors.blueGradient5,
              borderWidth: 2,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: ModernCorporateColors.blueGradient5,
              borderWidth: 2,
            },
            '&.Mui-focused': {
              transform: 'scale(1.02)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${ModernCorporateColors.lightGrayDark}`,
          boxShadow: `0 2px 20px ${ModernCorporateColors.navyBlue20}`,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        h1: {
          fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
          fontWeight: 800,
        },
        h2: {
          fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
          fontWeight: 700,
        },
        h3: {
          fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
          fontWeight: 600,
        },
        h4: {
          fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
          fontWeight: 600,
        },
        h5: {
          fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
          fontWeight: 600,
        },
        h6: {
          fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
          fontWeight: 600,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 500,
        },
        secondary: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 400,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/demo" element={<ModernCorporateDemo />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/activity" element={<ActivityFeed />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leave-requests" element={<LeaveRequests />} />
                <Route path="/role-management" element={<RoleManagement />} />
                <Route path="/bulk-csv" element={<BulkCSV />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/testing" element={<TestingAccessibility />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
