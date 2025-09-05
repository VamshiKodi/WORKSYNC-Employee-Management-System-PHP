import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tab,
  Tabs,
  Paper,
  Slider,
  Avatar,
  Badge
} from '@mui/material';
import {
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    autoSave: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationSound: true,
    quietHours: { start: '22:00', end: '08:00' },
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true,
    
    // System Settings
    backupFrequency: 'daily',
    dataRetention: 365,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'xlsx', 'jpg', 'png']
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Simulate password change
    setShowPasswordDialog(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showPassword: false
    });
  };

  const handleBackup = () => {
    // Simulate backup creation
    setShowBackupDialog(false);
  };

  const handleFileTypeAdd = (fileType: string) => {
    if (fileType && !settings.allowedFileTypes.includes(fileType)) {
      setSettings(prev => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, fileType]
      }));
    }
  };

  const handleFileTypeRemove = (fileType: string) => {
    setSettings(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter(type => type !== fileType)
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        mb: 3
      }}>
        System Settings
      </Typography>

      {saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="General" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<StorageIcon />} label="System" />
        </Tabs>

        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Appearance
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingChange('general', 'darkMode', e.target.checked)}
                      />
                    }
                    label="Dark Mode"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Localization
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="EST">Eastern Time</MenuItem>
                      <MenuItem value="PST">Pacific Time</MenuItem>
                      <MenuItem value="GMT">Greenwich Mean Time</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    General Preferences
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
                      />
                    }
                    label="Auto-save changes"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Channels
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationSound}
                        onChange={(e) => handleSettingChange('notifications', 'notificationSound', e.target.checked)}
                      />
                    }
                    label="Notification Sounds"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quiet Hours
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Start Time"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => handleSettingChange('notifications', 'quietHours', {
                          ...settings.quietHours,
                          start: e.target.value
                        })}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="End Time"
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => handleSettingChange('notifications', 'quietHours', {
                          ...settings.quietHours,
                          end: e.target.value
                        })}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Authentication
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.loginAlerts}
                        onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                      />
                    }
                    label="Login Alerts"
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowPasswordDialog(true)}
                      startIcon={<LockIcon />}
                    >
                      Change Password
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Management
                  </Typography>
                  <Typography gutterBottom>
                    Session Timeout (minutes): {settings.sessionTimeout}
                  </Typography>
                  <Slider
                    value={settings.sessionTimeout}
                    onChange={(e, value) => handleSettingChange('security', 'sessionTimeout', value)}
                    min={5}
                    max={120}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <Typography gutterBottom sx={{ mt: 2 }}>
                    Password Expiry (days): {settings.passwordExpiry}
                  </Typography>
                  <Slider
                    value={settings.passwordExpiry}
                    onChange={(e, value) => handleSettingChange('security', 'passwordExpiry', value)}
                    min={30}
                    max={365}
                    step={30}
                    marks
                    valueLabelDisplay="auto"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <BackupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Backup & Recovery
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select
                      value={settings.backupFrequency}
                      onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                    >
                      <MenuItem value="hourly">Hourly</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={() => setShowBackupDialog(true)}
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Create Backup Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Data Management
                  </Typography>
                  <Typography gutterBottom>
                    Data Retention (days): {settings.dataRetention}
                  </Typography>
                  <Slider
                    value={settings.dataRetention}
                    onChange={(e, value) => handleSettingChange('system', 'dataRetention', value)}
                    min={30}
                    max={2555}
                    step={30}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <Typography gutterBottom sx={{ mt: 2 }}>
                    Max File Size (MB): {settings.maxFileSize}
                  </Typography>
                  <Slider
                    value={settings.maxFileSize}
                    onChange={(e, value) => handleSettingChange('system', 'maxFileSize', value)}
                    min={1}
                    max={100}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Allowed File Types
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {settings.allowedFileTypes.map((type) => (
                      <Chip
                        key={type}
                        label={type}
                        onDelete={() => handleFileTypeRemove(type)}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <TextField
                    label="Add File Type"
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleFileTypeAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          startIcon={<RestoreIcon />}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
          startIcon={<SaveIcon />}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type={passwordData.showPassword ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setPasswordData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                >
                  {passwordData.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={passwordData.showPassword ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={passwordData.showPassword ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onClose={() => setShowBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a complete backup of your system data including:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="User accounts and profiles" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Employee records" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attendance data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="System settings" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupDialog(false)}>Cancel</Button>
          <Button onClick={handleBackup} variant="contained">Create Backup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;