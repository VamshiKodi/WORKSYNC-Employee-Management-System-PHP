import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  Refresh,
  Login,
  Logout,
  PersonAdd,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  EventNote,
} from '@mui/icons-material';

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/activities?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data || []);
        setError(null);
      } else {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch activities');
        } catch {
          setError(`Failed to fetch activities (Status: ${response.status})`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <Login sx={{ color: '#4caf50' }} />;
      case 'logout':
        return <Logout sx={{ color: '#f44336' }} />;
      case 'create_employee':
        return <PersonAdd sx={{ color: '#2196f3' }} />;
      case 'update_employee':
        return <Edit sx={{ color: '#ff9800' }} />;
      case 'delete_employee':
        return <Delete sx={{ color: '#f44336' }} />;
      case 'submit_leave':
        return <EventNote sx={{ color: '#9c27b0' }} />;
      case 'approve_leave':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'reject_leave':
        return <Cancel sx={{ color: '#f44336' }} />;
      default:
        return <EventNote sx={{ color: '#757575' }} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth':
        return 'primary';
      case 'employee':
        return 'info';
      case 'leave':
        return 'secondary';
      case 'system':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
            Activity Feed
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
            Recent system activities and user actions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchActivities}
          sx={{ textTransform: 'none' }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2 }}>
        {activities.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <EventNote sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No activities found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Activities will appear here as users interact with the system
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      background: '#f8fafc',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      {getActivityIcon(activity.action)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {activity.username}
                        </Typography>
                        <Chip
                          label={activity.category}
                          size="small"
                          color={getCategoryColor(activity.category) as any}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Card>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {activities.length} recent activities
        </Typography>
      </Box>
    </Container>
  );
};

export default ActivityFeed;
