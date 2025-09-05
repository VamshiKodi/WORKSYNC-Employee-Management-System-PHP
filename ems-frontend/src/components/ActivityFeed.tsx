import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  Refresh, 
  Search, 
  FilterList, 
  TrendingUp, 
  Notifications, 
  Assignment,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { ModernCorporateColors } from '../styles/modern-corporate-colors';
import { getAllActivities, getActivityStats } from '../services/activityAPI';
import { Activity, ActivityFilters, ActivityStats } from '../types/activity';

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    limit: 10,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const getActivityIcon = (type: string) => {
    const iconStyle = { color: ModernCorporateColors.blueGradient5 };
    switch (type) {
      case 'login':
        return <CheckCircle style={iconStyle} />;
      case 'logout':
        return <Error style={iconStyle} />;
      case 'task':
        return <Assignment style={iconStyle} />;
      case 'system':
        return <Info style={iconStyle} />;
      case 'update':
        return <TrendingUp style={iconStyle} />;
      default:
        return <Notifications style={iconStyle} />;
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return ModernCorporateColors.error;
      case 'medium':
        return ModernCorporateColors.warning;
      case 'low':
      default:
        return ModernCorporateColors.success;
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [activitiesResponse, statsResponse] = await Promise.all([
        getAllActivities({
          page: filters.page,
          limit: filters.limit,
          search: searchQuery,
          type: filters.type,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
        getActivityStats({
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);
      
      const normalizedActivities: Activity[] = activitiesResponse.data.map((activity: Activity) => ({
        ...activity,
        timestamp: new Date(activity.timestamp as any),
      }));

      setActivities(normalizedActivities);
      setStats(statsResponse);
      setPagination({
        total: activitiesResponse.total,
        totalPages: activitiesResponse.totalPages,
        currentPage: activitiesResponse.page,
      });
      
      setSnackbarMessage('Activities loaded successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Please try again.');
      setSnackbarMessage('Failed to load activities');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filters, searchQuery]);

  const handleRefresh = () => {
    fetchActivities();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setFilters(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: Partial<ActivityFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderActivityContent = (activity: Activity) => {
    const user = typeof activity.user === 'string' 
      ? { name: 'System', role: 'System', department: 'System' } 
      : activity.user;
      
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
            {activity.action}
          </Typography>
        </Box>
        {activity.details && (
          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray, mb: 0.5 }}>
            {activity.details}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: ModernCorporateColors.slateGrayLight }}>
            {new Date(activity.timestamp).toLocaleString()}
          </Typography>
          {user.role && user.department && (
            <Typography variant="caption" sx={{ color: ModernCorporateColors.slateGrayLight }}>
              {user.role} • {user.department}
            </Typography>
          )}
          <Chip
            label={activity.priority}
            size="small"
            sx={{
              background: getPriorityColor(activity.priority),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              textTransform: 'capitalize',
            }}
          />
        </Box>
      </>
    );
  };

  if (loading && activities.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchActivities}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Activity Feed
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ mr: 1 }}
              onClick={() => setShowFilters((s) => !s)}
            >
              Filters
            </Button>
          </Box>
        </Box>
        {showFilters && (
          <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <TextField
              select
              label="Type"
              value={filters.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
              SelectProps={{ native: true }}
            >
              <option value="">All</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="task">Task</option>
              <option value="system">System</option>
              <option value="update">Update</option>
              <option value="other">Other</option>
            </TextField>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
            />
            <Button
              variant="text"
              onClick={() => setFilters({ page: 1, limit: 10, sortBy: 'timestamp', sortOrder: 'desc' })}
            >
              Clear Filters
            </Button>
          </Box>
        )}
        <Box mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 180, 216, 0.2)',
            borderRadius: 3,
            height: 'fit-content',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <List sx={{ p: 0 }}>
              {activities.map((activity) => (
                <Box key={(activity as any)._id || (activity as any).id}>
                  <ListItem
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        background: 'rgba(0, 180, 216, 0.05)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: `linear-gradient(135deg, ${getPriorityColor(activity.priority)} 0%, ${ModernCorporateColors.blueGradient5} 100%)`,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>
                            {typeof activity.user === 'string' ? 'System' : activity.user.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                            {activity.action}
                          </Typography>
                        </Box>
                      }
                      secondary={renderActivityContent(activity)}
                    />
                    
                    <ListItemSecondaryAction />
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
        {pagination.totalPages > 1 && (
          <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
              startIcon={<Refresh style={{ transform: 'rotate(180deg)' }} />}
            >
              Previous
            </Button>
            <Typography variant="body2" color="textSecondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              endIcon={<Refresh />}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default ActivityFeed;