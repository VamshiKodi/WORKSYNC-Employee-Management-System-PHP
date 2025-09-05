import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Edit,
  Visibility,
  VisibilityOff,
  Cancel,
  Person,
  Assessment,
  Schedule,
  Work,
  TrendingUp,
  PhotoCamera,
  Save,
  Lock,
  Settings,
} from '@mui/icons-material';
import ModernCorporateColors from '../styles/modern-corporate-colors';

// Mock user data
const userData = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@company.com',
  phone: '+1 (555) 123-4567',
  position: 'Senior Software Engineer',
  department: 'Engineering',
  location: 'San Francisco, CA',
  avatar: 'JD',
  joinDate: '2022-03-15',
  employeeId: 'EMP-2022-001',
  manager: 'Sarah Wilson',
  team: 'Frontend Development',
  skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'],
  languages: ['English', 'Spanish'],
  timezone: 'PST (UTC-8)',
  bio: 'Passionate software engineer with 5+ years of experience in full-stack development. Specialized in React and Node.js ecosystems.',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
      weekly: true,
    },
    privacy: {
      profileVisible: true,
      activityVisible: true,
      contactVisible: true,
    },
    theme: 'light',
    language: 'en',
  },
  stats: {
    projectsCompleted: 24,
    tasksCompleted: 156,
    attendanceRate: 94.2,
    performanceScore: 87.5,
  },
};

const Profile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [user, setUser] = useState(userData);
  const [formData, setFormData] = useState(userData);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(user);
  };

  const handleSave = () => {
    setUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (category: string, setting: string, value: boolean) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...(prev.preferences[category as keyof typeof prev.preferences] || {}) as object,
          [setting]: value,
        },
      },
    }));
  };

  const handlePasswordChange = () => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
      // Handle password change logic here
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const recentActivities = [
    { action: 'Updated profile information', time: '2 hours ago', icon: <Person /> },
    { action: 'Completed project review', time: '1 day ago', icon: <Assessment /> },
    { action: 'Submitted leave request', time: '2 days ago', icon: <Schedule /> },
    { action: 'Joined team meeting', time: '3 days ago', icon: <Work /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: ModernCorporateColors.lightGray, p: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
            }}
          >
            Profile
          </Typography>
          <Typography variant="body1" sx={{ color: ModernCorporateColors.slateGrayLight }}>
            Manage your profile, preferences, and account settings
          </Typography>
        </Box>

        {/* Main Profile Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, gap: 3 }}>
          {/* Left Column - Main Profile */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 180, 216, 0.2)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
                  <Tab label="Overview" />
                  <Tab label="Settings" />
                  <Tab label="Activity" />
                </Tabs>
              </Box>

              {/* Overview Tab */}
              {tabValue === 0 && (
                <Box sx={{ p: 3 }}>
                  {/* Profile Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Tooltip title="Change Avatar">
                            <IconButton
                              size="small"
                              aria-label="Change Avatar"
                              onClick={() => {}} // Removed setShowAvatarDialog
                              sx={{
                                background: ModernCorporateColors.blueGradient1,
                                color: 'white',
                                '&:hover': { background: ModernCorporateColors.blueGradient3 },
                              }}
                            >
                              <PhotoCamera fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            fontSize: '2rem',
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${ModernCorporateColors.blueGradient1} 0%, ${ModernCorporateColors.blueGradient5} 100%)`,
                          }}
                        >
                          {user.avatar}
                        </Avatar>
                      </Badge>
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1 }}>
                          {user.name}
                        </Typography>
                        {!isEditing && (
                          <Tooltip title="Edit Profile">
                            <IconButton
                              aria-label="Edit Profile"
                              onClick={handleEdit}
                              sx={{
                                background: 'rgba(0, 180, 216, 0.1)',
                                '&:hover': { background: 'rgba(0, 180, 216, 0.2)' },
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ color: ModernCorporateColors.slateGray, mb: 1 }}>
                        {user.position}
                      </Typography>
                      <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                        {user.department} • {user.location}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stats Cards */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
                    {[
                      { label: 'Projects', value: user.stats.projectsCompleted, icon: <Work /> },
                      { label: 'Tasks', value: user.stats.tasksCompleted, icon: <Assessment /> },
                      { label: 'Attendance', value: `${user.stats.attendanceRate}%`, icon: <Schedule /> },
                      { label: 'Performance', value: `${user.stats.performanceScore}%`, icon: <TrendingUp /> },
                    ].map((stat, index) => (
                      <Card key={index} sx={{ background: 'rgba(255, 255, 255, 0.8)', borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Box sx={{ color: ModernCorporateColors.blueGradient1, mb: 1 }}>
                            {stat.icon}
                          </Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                            {stat.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  {/* Personal Information */}
                  <Typography variant="h6" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1, mb: 2 }}>
                    Personal Information
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
                    <TextField
                      label="Full Name"
                      value={isEditing ? formData.name : user.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    <TextField
                      label="Email"
                      value={isEditing ? formData.email : user.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    <TextField
                      label="Phone"
                      value={isEditing ? formData.phone : user.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    <TextField
                      label="Location"
                      value={isEditing ? formData.location : user.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                  </Box>

                  {/* Skills */}
                  <Typography variant="h6" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1, mb: 2 }}>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                    {user.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        sx={{
                          background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.1) 0%, rgba(3, 4, 94, 0.1) 100%)',
                          color: ModernCorporateColors.blueGradient1,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>

                  {/* Bio */}
                  <Typography variant="h6" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1, mb: 2 }}>
                    Bio
                  </Typography>
                  <TextField
                    multiline
                    rows={4}
                    value={isEditing ? formData.bio : user.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.8)' } }}
                  />

                  {/* Edit Actions */}
                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        sx={{
                          background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)',
                          '&:hover': { background: 'linear-gradient(135deg, #0077b6 0%, #03045e 100%)' },
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        sx={{
                          borderColor: ModernCorporateColors.blueGradient1,
                          color: ModernCorporateColors.blueGradient1,
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* Settings Tab */}
              {tabValue === 1 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                    Account Settings
                  </Typography>

                  {/* Notifications */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Notifications
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {Object.entries(user.preferences.notifications).map(([key, value]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: ModernCorporateColors.blueGradient1,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: ModernCorporateColors.blueGradient1,
                              },
                            }}
                          />
                        }
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        sx={{ display: 'block', mb: 1 }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Privacy */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Privacy
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {Object.entries(user.preferences.privacy).map(([key, value]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => handlePreferenceChange('privacy', key, e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: ModernCorporateColors.blueGradient1,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: ModernCorporateColors.blueGradient1,
                              },
                            }}
                          />
                        }
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        sx={{ display: 'block', mb: 1 }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Security */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Security
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={() => setShowPasswordDialog(true)}
                    sx={{
                      borderColor: ModernCorporateColors.blueGradient1,
                      color: ModernCorporateColors.blueGradient1,
                      '&:hover': {
                        borderColor: ModernCorporateColors.blueGradient3,
                        background: 'rgba(0, 180, 216, 0.1)',
                      },
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              )}

              {/* Activity Tab */}
              {tabValue === 2 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                    Recent Activity
                  </Typography>
                  <List>
                    {recentActivities.map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: ModernCorporateColors.blueGradient1 }}>
                          {activity.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.action}
                          secondary={activity.time}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ color: ModernCorporateColors.slateGrayLight }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Quick Actions & Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Quick Actions */}
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 180, 216, 0.2)',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    fullWidth
                    sx={{
                      borderColor: ModernCorporateColors.blueGradient1,
                      color: ModernCorporateColors.blueGradient1,
                      '&:hover': {
                        borderColor: ModernCorporateColors.blueGradient3,
                        background: 'rgba(0, 180, 216, 0.1)',
                      },
                    }}
                  >
                    Advanced Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Employee Info */}
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 180, 216, 0.2)',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                  Employee Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray }}>
                      Employee ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.employeeId}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray }}>
                      Join Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(user.joinDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray }}>
                      Manager
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.manager}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray }}>
                      Team
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.team}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: ModernCorporateColors.blueGradient1, fontWeight: 600 }}>
            Change Password
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <Alert severity="error">Passwords do not match</Alert>
              )}
              {newPassword && newPassword.length < 8 && (
                <Alert severity="warning">Password must be at least 8 characters long</Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button
              onClick={handlePasswordChange}
              disabled={newPassword !== confirmPassword || newPassword.length < 8}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #0077b6 0%, #03045e 100%)' },
              }}
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile; 