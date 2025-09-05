import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';
import Dashboard from '@mui/icons-material/Dashboard';
import Logout from '@mui/icons-material/Logout';

interface NavigationProps {
  userType: 'admin' | 'employee';
  userName: string;
}

const Navigation: React.FC<NavigationProps> = ({ userType, userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{
      background: 'linear-gradient(90deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)',
      boxShadow: '0 4px 24px rgba(3,4,94,0.12)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 } }}>
        <Dashboard sx={{ mr: 2, color: '#90e0ef', fontSize: 32 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 800,
            letterSpacing: 1,
            background: 'linear-gradient(45deg, #00b4d8 0%, #48cae4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
          }}
        >
          WORKSYNC - {userType === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'linear-gradient(135deg, #00b4d8 0%, #48cae4 100%)',
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,180,216,0.18)',
            }}
          >
            {userName.charAt(0)}
          </Avatar>
          <Button
            sx={{
              background: 'linear-gradient(135deg, #00b4d8 0%, #48cae4 100%)',
              color: '#fff',
              fontWeight: 700,
              px: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,180,216,0.12)',
              '&:hover': {
                background: 'linear-gradient(135deg, #48cae4 0%, #00b4d8 100%)',
                color: '#fff',
              },
            }}
            onClick={handleLogout}
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 