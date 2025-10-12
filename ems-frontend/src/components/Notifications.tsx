import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Badge,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Send as SendIcon
} from '@mui/icons-material';

interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  category: 'system' | 'hr' | 'payroll' | 'attendance';
  sender: string;
}

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read when component mounts
  React.useEffect(() => {
    const markAllAsRead = async () => {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/notifications/mark-all-read', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Trigger notification update event
        window.dispatchEvent(new Event('notificationUpdated'));
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    };

    if (notifications.length > 0) {
      markAllAsRead();
    }
  }, [notifications.length]);
  
  // Load notifications from localStorage or use default (fallback)
  const loadNotifications = (): Notification[] => {
    // Default notifications
    return [
      {
        id: 1,
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance on Sunday, Jan 28th from 2:00 AM - 4:00 AM EST. System will be temporarily unavailable.',
        type: 'warning',
        timestamp: '2024-01-22 09:30:00',
        read: false,
        category: 'system',
        sender: 'System Admin'
      },
    {
      id: 2,
      title: 'New Employee Onboarding',
      message: 'Sarah Johnson has been added to the system. Please review and approve her access permissions.',
      type: 'info',
      timestamp: '2024-01-22 08:15:00',
      read: false,
      category: 'hr',
      sender: 'HR Department'
    },
    {
      id: 3,
      title: 'Payroll Processing Complete',
      message: 'January payroll has been successfully processed for 247 employees. Reports are now available.',
      type: 'success',
      timestamp: '2024-01-21 16:45:00',
      read: true,
      category: 'payroll',
      sender: 'Payroll System'
    },
    {
      id: 4,
      title: 'Attendance Anomaly Detected',
      message: 'Unusual attendance patterns detected for 3 employees. Review required.',
      type: 'warning',
      timestamp: '2024-01-21 14:20:00',
      read: true,
      category: 'attendance',
      sender: 'Attendance System'
    },
    {
      id: 5,
      title: 'Database Backup Failed',
      message: 'Automated backup failed at 3:00 AM. Manual backup required immediately.',
      type: 'error',
      timestamp: '2024-01-21 03:05:00',
      read: false,
      category: 'system',
      sender: 'System Admin'
    }
    ];
  };
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    hrUpdates: true,
    payrollAlerts: true,
    attendanceAlerts: true,
  });
  
  const [composeDialog, setComposeDialog] = useState(false);
  const [newNotification, setNewNotification] = useState<Omit<Notification, 'id' | 'timestamp' | 'read' | 'sender'>>({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const markAsRead = (id: string | number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string | number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success': return <CheckCircleIcon sx={{ color: '#10b981' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#ef4444' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#f59e0b' }} />;
      default: return <InfoIcon sx={{ color: '#3b82f6' }} />;
    }
  };

  const getNotificationColor = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success': return '#34C759';
      case 'error': return '#FF3B3F';
      case 'warning': return '#F7DC6F';
      default: return '#03A9F4';
    }
  };

  const getCategoryIcon = (category: 'system' | 'hr' | 'payroll' | 'attendance') => {
    switch (category) {
      case 'hr': return <PersonIcon sx={{ color: '#ec4899' }} />;
      case 'payroll': return <AttachMoneyIcon sx={{ color: '#8b5cf6' }} />;
      case 'attendance': return <AccessTimeIcon sx={{ color: '#06b6d4' }} />;
      default: return <InfoIcon sx={{ color: '#6b7280' }} />;
    }
  };

  const filteredNotifications = activeTab === 0 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSendNotification = () => {
    const notification: Notification = {
      id: Date.now(),
      ...newNotification,
      timestamp: new Date().toLocaleString(),
      read: false,
      sender: 'Admin'
    };
    setNotifications([notification, ...notifications]);
    setNewNotification({ 
      title: '', 
      message: '', 
      type: 'info', 
      category: 'system' as const 
    });
    setComposeDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewNotification(prev => ({
      ...prev,
      [name]: name === 'type' ? value as 'info' | 'success' | 'warning' | 'error' :
              name === 'category' ? value as 'system' | 'hr' | 'payroll' | 'attendance' :
              value
    }));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            borderRadius: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                Notifications Center
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage system alerts, announcements, and communication
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setComposeDialog(true)}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              New Notification
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Notifications List */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ borderRadius: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab 
                    label={
                      <Badge badgeContent={notifications.length} color="primary">
                        All Notifications
                      </Badge>
                    } 
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={unreadCount} color="error">
                        Unread
                      </Badge>
                    } 
                  />
                </Tabs>
              </Box>
              
              <List sx={{ p: 0 }}>
                {filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getNotificationColor(notification.type) }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: notification.read ? 400 : 600,
                                flex: 1
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Chip
                              label={notification.category}
                              size="small"
                              sx={{
                                backgroundColor: getNotificationColor(notification.type),
                                color: getNotificationColor(notification.type),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.sender} • {notification.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {!notification.read && (
                            <IconButton
                              size="small"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                              color="primary"
                            >
                              <MarkEmailReadIcon />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Settings Panel */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ mr: 2, color: '#6366f1' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notification Settings
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                    />
                  }
                  label="System Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.hrUpdates}
                      onChange={(e) => setSettings(prev => ({ ...prev, hrUpdates: e.target.checked }))}
                    />
                  }
                  label="HR Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.payrollAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, payrollAlerts: e.target.checked }))}
                    />
                  }
                  label="Payroll Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.attendanceAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, attendanceAlerts: e.target.checked }))}
                    />
                  }
                  label="Attendance Alerts"
                />
              </Box>
            </Paper>

            {/* Quick Stats */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Notification Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                      {notifications.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                      {unreadCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unread
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Compose Dialog */}
        <Dialog
          open={composeDialog}
          onClose={() => setComposeDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Send New Notification</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                value={newNotification.title}
                onChange={handleInputChange}
                name="title"
              />
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={newNotification.message}
                onChange={handleInputChange}
                name="message"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newNotification.type}
                      onChange={handleInputChange as (event: SelectChangeEvent<string>, child: React.ReactNode) => void}
                      name="type"
                      label="Type"
                    >
                      <MenuItem value="info">Info</MenuItem>
                      <MenuItem value="warning">Warning</MenuItem>
                      <MenuItem value="error">Error</MenuItem>
                      <MenuItem value="success">Success</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newNotification.category}
                      onChange={handleInputChange as (event: SelectChangeEvent<string>, child: React.ReactNode) => void}
                      name="category"
                      label="Category"
                    >
                      <MenuItem value="system">System</MenuItem>
                      <MenuItem value="hr">HR</MenuItem>
                      <MenuItem value="payroll">Payroll</MenuItem>
                      <MenuItem value="attendance">Attendance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setComposeDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSendNotification}
              variant="contained"
              startIcon={<SendIcon />}
              color="primary"
              component="button"
              disabled={!newNotification.title || !newNotification.message}
            >
              Send Notification
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Notifications;