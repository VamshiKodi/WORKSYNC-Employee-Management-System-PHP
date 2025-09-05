import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  Schedule,
  Notifications,
  CheckCircle,
  Warning,
  Info,
  AccessTime,
  Business,
  BarChart,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - in real app, this would come from APIs
  const stats = {
    totalEmployees: 247,
    activeProjects: 18,
    pendingTasks: 42,
    completedToday: 28,
  };

  const recentActivities = [
    { id: 1, user: 'John Smith', action: 'completed task', item: 'Q4 Report Review', time: '2 minutes ago', type: 'success' },
    { id: 2, user: 'Sarah Johnson', action: 'submitted', item: 'Leave Request', time: '15 minutes ago', type: 'info' },
    { id: 3, user: 'Mike Davis', action: 'updated', item: 'Project Timeline', time: '1 hour ago', type: 'warning' },
    { id: 4, user: 'Lisa Wilson', action: 'created', item: 'New Employee Profile', time: '2 hours ago', type: 'success' },
  ];

  const upcomingTasks = [
    { id: 1, title: 'Team Meeting', time: '10:00 AM', priority: 'high' },
    { id: 2, title: 'Review Budget Proposal', time: '2:00 PM', priority: 'medium' },
    { id: 3, title: 'Client Presentation', time: '4:30 PM', priority: 'high' },
    { id: 4, title: 'Weekly Report', time: '5:00 PM', priority: 'low' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'warning': return <Warning sx={{ color: '#f59e0b' }} />;
      case 'info': return <Info sx={{ color: '#3b82f6' }} />;
      default: return <Info sx={{ color: '#64748b' }} />;
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }} className="page-transition">
      {/* Background Effects */}
      <div className="parallax-bg" />
      <div className="interactive-bg" />
      <div className="floating-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            },
          }}
        >
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                Welcome to WorkSync Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Monitor your organization's performance and stay updated with real-time insights.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <AccessTime sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Current Time
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
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
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}>
                    <People sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {stats.totalEmployees}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Total Employees
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}>
                    <Business sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {stats.activeProjects}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Active Projects
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={72} 
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}>
                    <Assignment sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {stats.pendingTasks}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Pending Tasks
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={58} 
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}>
                    <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {stats.completedToday}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Completed Today
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={93} 
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Recent Activities */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ mr: 2, color: '#6366f1' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Recent Activities
                </Typography>
              </Box>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}>
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {activity.user}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.action}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.item}
                            </Typography>
                          </Box>
                        }
                        secondary={activity.time}
                      />
                      {getActivityIcon(activity.type)}
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Upcoming Tasks */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Schedule sx={{ mr: 2, color: '#6366f1' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Today's Schedule
                </Typography>
              </Box>
              <List>
                {upcomingTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                background: `${getPriorityColor(task.priority)}20`,
                                color: getPriorityColor(task.priority),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: '#64748b' }} />
                            <Typography variant="caption" color="text.secondary">
                              {task.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < upcomingTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
