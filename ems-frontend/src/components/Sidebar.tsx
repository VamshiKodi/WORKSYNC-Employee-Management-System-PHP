import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SecurityIcon from '@mui/icons-material/Security';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const navItems = [
  { 
    label: 'Dashboard', 
    icon: <DashboardIcon />, 
    to: '/dashboard', 
    badge: null,
    description: 'Overview & Statistics'
  },
  { 
    label: 'Analytics', 
    icon: <BarChartIcon />, 
    to: '/analytics', 
    badge: 'New',
    description: 'Data Insights & Reports'
  },
  { 
    label: 'Activity Feed', 
    icon: <TimelineIcon />, 
    to: '/activity', 
    badge: null,
    description: 'Recent Activities'
  },
  { 
    label: 'Profile', 
    icon: <PersonIcon />, 
    to: '/profile', 
    badge: null,
    description: 'User Profile & Settings'
  },
  { 
    label: 'Leave Requests', 
    icon: <EventNoteIcon />, 
    to: '/leave-requests', 
    badge: '3',
    description: 'Manage Leave Applications'
  },
  { 
    label: 'Role Management', 
    icon: <SecurityIcon />, 
    to: '/role-management', 
    badge: null,
    description: 'User Roles & Permissions'
  },
  { 
    label: 'Bulk Import/Export', 
    icon: <UploadFileIcon />, 
    to: '/bulk-csv', 
    badge: null,
    description: 'Data Import & Export'
  },
  { 
    label: 'Notifications', 
    icon: <NotificationsIcon />, 
    to: '/notifications', 
    badge: '5',
    description: 'System Notifications'
  },
  { 
    label: 'Settings', 
    icon: <SettingsIcon />, 
    to: '/settings', 
    badge: null,
    description: 'System Configuration'
  },
];

const drawerWidth = 320;

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #03045e 0%, #023e8a 20%, #0077b6 40%, #0096c7 60%, #00b4d8 80%, #48cae4 100%)',
          color: '#fff',
          borderRight: 'none',
          boxShadow: '8px 0 32px rgba(3, 4, 94, 0.3)',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(72, 202, 228, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(144, 224, 239, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        },
      }}
    >
      {/* Enhanced Header Section */}
      <Box 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          },
        }}
      >
        {/* Company Logo & Badge */}
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #48cae4 0%, #90e0ef 50%, #ade8f4 100%)',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: '0 8px 32px rgba(72, 202, 228, 0.4), 0 0 0 4px rgba(255,255,255,0.1)',
              border: '3px solid rgba(255,255,255,0.2)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: 'linear-gradient(45deg, #48cae4, #90e0ef, #ade8f4, #48cae4)',
                borderRadius: '50%',
                zIndex: -1,
                animation: 'spin 3s linear infinite',
              },
            }}
          >
            WS
          </Avatar>
        </Box>

        {/* Company Name */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: 2,
            background: 'linear-gradient(45deg, #fff 0%, #ade8f4 50%, #fff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          WORKSYNC
        </Typography>
        
        {/* Company Description */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: 1,
            fontWeight: 500,
            mb: 2,
          }}
        >
          Empowering your workforce
        </Typography>

      </Box>

      {/* Enhanced Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 3 }}>
        <List sx={{ px: 2 }}>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <ListItem 
                key={item.label} 
                disablePadding 
                sx={{ mb: 1 }}
              >
                <Tooltip 
                  title={item.description}
                  placement="right"
                  arrow
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      background: 'rgba(0,0,0,0.9)',
                      color: 'white',
                      fontSize: '0.8rem',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <ListItemButton
                    component={Link}
                    to={item.to}
                    selected={isActive}
                    sx={{
                      borderRadius: 3,
                      mx: 0.5,
                      py: 2,
                      px: 3,
                      color: 'rgba(255,255,255,0.85)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: 56,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'
                          : 'transparent',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: isActive 
                          ? 'linear-gradient(180deg, #48cae4 0%, #90e0ef 100%)'
                          : 'transparent',
                        borderRadius: '0 2px 2px 0',
                        transition: 'all 0.3s ease',
                      },
                      '&.Mui-selected': {
                        background: 'rgba(255,255,255,0.12)',
                        color: '#fff',
                        boxShadow: '0 8px 32px rgba(255,255,255,0.15)',
                        transform: 'translateX(8px)',
                        '&::before': {
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#48cae4',
                        },
                      },
                      '&:hover': {
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        transform: 'translateX(4px)',
                        '&::before': {
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#90e0ef',
                        },
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: 'inherit',
                        minWidth: 44,
                        '& .MuiSvgIcon-root': {
                          fontSize: '1.5rem',
                          transition: 'all 0.3s ease',
                          filter: isActive ? 'drop-shadow(0 2px 4px rgba(72, 202, 228, 0.3))' : 'none',
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: 0.5,
                        lineHeight: 1.2,
                      }}
                    />
                    {item.badge && (
                      <Badge
                        badgeContent={item.badge}
                        sx={{
                          '& .MuiBadge-badge': {
                            background: item.badge === 'New' 
                              ? 'linear-gradient(135deg, #00b4d8 0%, #48cae4 100%)'
                              : 'linear-gradient(135deg, #ff5722 0%, #ff7043 100%)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            minWidth: 20,
                            height: 20,
                            borderRadius: 10,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Enhanced Footer Section */}
      <Box 
        sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          },
        }}
      >
        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                mr: 2,
                background: 'linear-gradient(135deg, #90e0ef 0%, #ade8f4 100%)',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(144, 224, 239, 0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              JD
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 16,
                height: 16,
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  background: 'white',
                  borderRadius: '50%',
                }}
              />
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
              John Doe
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 0.5 }}>
              Senior Administrator
            </Typography>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            size="small"
            aria-label="Company Info"
            sx={{
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
              },
            }}
          >
            <BusinessIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Settings"
            sx={{
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
              },
            }}
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Drawer>
  );
};

export default Sidebar; 