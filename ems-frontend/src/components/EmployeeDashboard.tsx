import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  AppBar,
  Toolbar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openProfileDialog, setOpenProfileDialog] = useState(false);

  // Use authenticated user data or fallback to default
    // Only store and display work-related, non-sensitive information
  const [profileData, setProfileData] = useState({
    name: user?.employeeData ? `${user.employeeData.firstName} ${user.employeeData.lastName.charAt(0)}.` : 'Employee',
    department: user?.employeeData?.department || 'General',
    position: user?.employeeData?.position || 'Employee',
    avatar: user?.employeeData ? `${user.employeeData.firstName.charAt(0)}${user.employeeData.lastName.charAt(0)}` : 'EM',
  });

  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Review employee handbook',
      description: 'Update and review the company employee handbook for 2024',
      status: 'completed',
      dueDate: '2024-01-15',
      priority: 'high',
      progress: 100,
    },
    {
      id: 2,
      title: 'Conduct performance reviews',
      description: 'Schedule and conduct quarterly performance reviews for team members',
      status: 'in-progress',
      dueDate: '2024-01-30',
      priority: 'medium',
      progress: 65,
    },
    {
      id: 3,
      title: 'Update training materials',
      description: 'Create new training materials for onboarding process',
      status: 'pending',
      dueDate: '2024-02-15',
      priority: 'low',
      progress: 0,
    },
    {
      id: 4,
      title: 'Recruitment planning',
      description: 'Plan recruitment strategy for Q2 2024',
      status: 'in-progress',
      dueDate: '2024-02-28',
      priority: 'high',
      progress: 35,
    },
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Profile viewing only
  const handleEditProfile = () => {
    setOpenProfileDialog(true);
  };

  const handleCloseProfile = () => {
    setOpenProfileDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#64748b';
      default: return '#64748b';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  // const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;

  return (
    <Box sx={{ minHeight: '100vh' }} className="page-transition">
      {/* Cinematic Background Effects */}
      <div className="parallax-bg" />
      <div className="interactive-bg" />
      <div className="floating-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                WS
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
              Employee Dashboard
            </Typography>
          </Box>
          <Button 
            onClick={handleLogout}
            sx={{ 
              color: '#6366f1',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                border: '2px solid rgba(255,255,255,0.3)',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {profileData.avatar}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                Welcome back! 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                {profileData.position} • {profileData.department}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleEditProfile}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white', 
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  },
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
              >
                View Profile
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card elevation={0} sx={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 700 }}>📋</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {tasks.length}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                Total Tasks
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 700 }}>✅</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {completedTasks}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                Completed
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 700 }}>🔄</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {inProgressTasks}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                In Progress
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 700 }}>📊</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {Math.round(totalProgress)}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                Overall Progress
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Personal Information */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            flex: 1,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4,
          }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
              Personal Information
            </Typography>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Name" 
                  secondary={profileData.name}
                  primaryTypographyProps={{ sx: { fontWeight: 600, color: '#64748b' } }}
                  secondaryTypographyProps={{ sx: { color: '#1e293b', fontWeight: 500 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Employee ID" 
                  secondary={user?.employeeData?.employeeId || 'N/A'}
                  primaryTypographyProps={{ sx: { fontWeight: 600, color: '#64748b' } }}
                  secondaryTypographyProps={{ sx: { color: '#1e293b', fontWeight: 500 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Department" 
                  secondary={profileData.department}
                  primaryTypographyProps={{ sx: { fontWeight: 600, color: '#64748b' } }}
                  secondaryTypographyProps={{ sx: { color: '#1e293b', fontWeight: 500 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Position" 
                  secondary={profileData.position}
                  primaryTypographyProps={{ sx: { fontWeight: 600, color: '#64748b' } }}
                  secondaryTypographyProps={{ sx: { color: '#1e293b', fontWeight: 500 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Employment Status" 
                  secondary="Active"
                  primaryTypographyProps={{ sx: { fontWeight: 600, color: '#64748b' } }}
                  secondaryTypographyProps={{ sx: { color: '#1e293b', fontWeight: 500 } }}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Tasks */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            flex: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4,
          }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
              My Tasks
            </Typography>
            <List>
              {tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', flex: 1 }}>
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{ 
                            background: `linear-gradient(135deg, ${getStatusColor(task.status)}20, ${getStatusColor(task.status)}10)`,
                            color: getStatusColor(task.status),
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{ 
                            background: `linear-gradient(135deg, ${getPriorityColor(task.priority)}20, ${getPriorityColor(task.priority)}10)`,
                            color: getPriorityColor(task.priority),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {task.description}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                            Progress
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {task.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={task.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${getStatusColor(task.status)}, ${getStatusColor(task.status)}dd)`,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Due: {task.dueDate}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < tasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Edit Profile Dialog */}
        <Dialog 
          open={openProfileDialog} 
          onClose={() => setOpenProfileDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: '#1e293b' }}>
            Your Profile
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  bgcolor: 'primary.main',
                }}
              >
                {profileData.avatar}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {profileData.name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {profileData.position}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {profileData.department} Department
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                For any updates to your profile, please contact your HR department.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={handleCloseProfile} 
              variant="outlined"
              sx={{ minWidth: 120 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
};

export default EmployeeDashboard;