import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Security,
  Notifications,
  Palette,
  Language,
  Person,
  Lock,
  Save,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setLanguage(settings.language || 'en');
        setTimezone(settings.timezone || 'Asia/Kolkata');
        setDateFormat(settings.dateFormat || 'DD/MM/YYYY');
        setEmailNotifications(settings.emailNotifications ?? true);
        setPushNotifications(settings.pushNotifications ?? true);
        setLeaveNotifications(settings.leaveNotifications ?? true);
        setSystemNotifications(settings.systemNotifications ?? true);
        setTheme(settings.theme || 'light');
        setCompactMode(settings.compactMode || false);
        setTwoFactorAuth(settings.twoFactorAuth || false);
        setSessionTimeout(settings.sessionTimeout || '30');
        
        // Apply theme immediately
        applyTheme(settings.theme || 'light');
        applyCompactMode(settings.compactMode || false);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // General Settings
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [leaveNotifications, setLeaveNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  // Appearance Settings
  const [theme, setTheme] = useState('light');
  const [compactMode, setCompactMode] = useState(false);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Apply theme changes - DISABLED (always light theme)
  const applyTheme = (newTheme: string) => {
    // Force light theme always
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    document.body.style.background = 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #cbd5e1 100%)';
    document.body.style.color = '#1e293b';
    // Reset any dark theme styles
    document.querySelectorAll('.MuiContainer-root, .MuiCard-root').forEach((el: any) => {
      el.style.backgroundColor = '';
      el.style.color = '';
    });
  };

  // Apply compact mode
  const applyCompactMode = (isCompact: boolean) => {
    if (isCompact) {
      document.documentElement.style.setProperty('--spacing-multiplier', '0.75');
    } else {
      document.documentElement.style.setProperty('--spacing-multiplier', '1');
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Handle compact mode change
  const handleCompactModeChange = (isCompact: boolean) => {
    setCompactMode(isCompact);
    applyCompactMode(isCompact);
  };

  // Handle push notification permission
  const handlePushNotificationChange = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushNotifications(true);
        setSnackbarMessage('Push notifications enabled!');
        setSnackbarOpen(true);
      } else {
        setPushNotifications(false);
        setSnackbarMessage('Push notification permission denied');
        setSnackbarOpen(true);
      }
    } else {
      setPushNotifications(enabled);
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      language,
      timezone,
      dateFormat,
      emailNotifications,
      pushNotifications,
      leaveNotifications,
      systemNotifications,
      theme,
      compactMode,
      twoFactorAuth,
      sessionTimeout,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Apply all settings
    applyTheme(theme);
    applyCompactMode(compactMode);
    
    setSnackbarMessage('Settings saved successfully!');
    setSnackbarOpen(true);
  };

  // Auto-save settings whenever they change
  React.useEffect(() => {
    const settings = {
      language,
      timezone,
      dateFormat,
      emailNotifications,
      pushNotifications,
      leaveNotifications,
      systemNotifications,
      theme,
      compactMode,
      twoFactorAuth,
      sessionTimeout,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [language, timezone, dateFormat, emailNotifications, pushNotifications, 
      leaveNotifications, systemNotifications, theme, compactMode, twoFactorAuth, sessionTimeout]);

  const isAdmin = user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
        Settings
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#64748b', mb: 4 }}>
        Manage your account preferences and system settings
      </Typography>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<Person />} label="General" iconPosition="start" />
          <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
          <Tab icon={<Palette />} label="Appearance" iconPosition="start" />
          <Tab icon={<Security />} label="Security" iconPosition="start" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            General Preferences
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={timezone}
                  label="Timezone"
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                  <MenuItem value="America/New_York">America/New York (EST)</MenuItem>
                  <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                  <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={dateFormat}
                  label="Date Format"
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Notification Preferences
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive notifications via email"
              />
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            </ListItem>
            <Divider />

            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive browser push notifications (requires permission)"
              />
              <Switch
                checked={pushNotifications}
                onChange={(e) => handlePushNotificationChange(e.target.checked)}
              />
            </ListItem>
            <Divider />

            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText
                primary="Leave Request Notifications"
                secondary="Get notified about leave request updates"
              />
              <Switch
                checked={leaveNotifications}
                onChange={(e) => setLeaveNotifications(e.target.checked)}
              />
            </ListItem>
            <Divider />

            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText
                primary="System Notifications"
                secondary="Receive system and maintenance alerts"
              />
              <Switch
                checked={systemNotifications}
                onChange={(e) => setSystemNotifications(e.target.checked)}
              />
            </ListItem>
          </List>
        </TabPanel>

        {/* Appearance Settings */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Appearance Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Theme customization is currently disabled. The system uses a light theme optimized for readability.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={compactMode}
                    onChange={(e) => handleCompactModeChange(e.target.checked)}
                  />
                }
                label="Compact Mode (Reduce spacing and padding)"
              />
              <Typography variant="caption" display="block" sx={{ ml: 4, color: '#64748b' }}>
                {compactMode ? '✓ Compact mode is active' : 'Standard spacing is active'}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Security Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Keep your account secure by enabling two-factor authentication and managing session settings.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                  />
                }
                label="Enable Two-Factor Authentication (2FA)"
              />
              <Typography variant="caption" display="block" sx={{ ml: 4, color: '#64748b' }}>
                Add an extra layer of security to your account
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Session Timeout</InputLabel>
                <Select
                  value={sessionTimeout}
                  label="Session Timeout"
                  onChange={(e) => setSessionTimeout(e.target.value)}
                >
                  <MenuItem value="15">15 minutes</MenuItem>
                  <MenuItem value="30">30 minutes</MenuItem>
                  <MenuItem value="60">1 hour</MenuItem>
                  <MenuItem value="120">2 hours</MenuItem>
                  <MenuItem value="never">Never</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {isAdmin && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Admin Security Settings
                </Typography>
                <Alert severity="warning">
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Administrator Controls
                  </Typography>
                  <Typography variant="body2">
                    • Require password change every 90 days<br />
                    • Enforce strong password policy<br />
                    • Enable login attempt monitoring<br />
                    • Configure IP whitelist
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <Divider />

        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b3fa0 100%)',
              },
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Container>
  );
};

export default Settings;
