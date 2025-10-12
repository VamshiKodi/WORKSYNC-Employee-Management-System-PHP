import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  CheckCircle,
  Cancel,
  Refresh,
  History,
  PlayArrow,
  Stop,
  Edit,
} from '@mui/icons-material';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AttendanceRecord {
  id: number;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  totalHours: number | string;
  status: string;
  notes: string | null;
  location: string | null;
}

interface AttendanceStatus {
  status: 'not_clocked_in' | 'clocked_in' | 'clocked_out';
  clockIn: string | null;
  clockOut: string | null;
  totalHours: number | string;
  attendanceStatus: string | null;
}

const Attendance: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  
  // Clock in/out dialog
  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [clockAction, setClockAction] = useState<'in' | 'out'>('in');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    console.log('Attendance component mounted. isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated) {
      fetchAttendanceStatus();
      fetchAttendanceRecords();
    } else {
      console.log('User not authenticated, skipping API calls');
    }
  }, [isAuthenticated, user]);

  const fetchAttendanceStatus = async () => {
    try {
      console.log('Fetching attendance status...');
      const response = await attendanceAPI.getStatus();
      console.log('Attendance status response:', response);
      setAttendanceStatus(response.data);
    } catch (err: any) {
      console.error('Error fetching attendance status:', err);
      setSnackbarMessage('Failed to fetch attendance status: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      console.log('Fetching attendance records...');
      const response = await attendanceAPI.getAll({ limit: 30 });
      console.log('Attendance records response:', response);
      setAttendanceRecords(response.data);
    } catch (err: any) {
      console.error('Error fetching attendance records:', err);
      setError(err.message || 'Failed to fetch attendance records');
      setSnackbarMessage('Failed to fetch attendance records: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      console.log('Attempting to clock in...', { location, notes });
      const response = await attendanceAPI.clockIn({ location, notes });
      console.log('Clock in response:', response);
      setSnackbarMessage('Clocked in successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setClockDialogOpen(false);
      setLocation('');
      setNotes('');
      fetchAttendanceStatus();
      fetchAttendanceRecords();
    } catch (err: any) {
      console.error('Clock in error:', err);
      setSnackbarMessage(err.message || 'Failed to clock in');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      await attendanceAPI.clockOut({ notes });
      setSnackbarMessage('Clocked out successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setClockDialogOpen(false);
      setNotes('');
      fetchAttendanceStatus();
      fetchAttendanceRecords();
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Failed to clock out');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const openClockDialog = (action: 'in' | 'out') => {
    setClockAction(action);
    setClockDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      case 'half_day': return 'info';
      case 'overtime': return 'secondary';
      default: return 'default';
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
          Attendance Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your daily attendance and view your attendance history
        </Typography>
      </Box>

      {/* Current Status Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Today's Status
              </Typography>
              {attendanceStatus ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={attendanceStatus.status.replace('_', ' ').toUpperCase()}
                    color={attendanceStatus.status === 'clocked_in' ? 'success' : 'default'}
                    sx={{ color: 'white', fontWeight: 600 }}
                  />
                  {attendanceStatus.clockIn && (
                    <Typography variant="body2">
                      Clock In: {formatTime(attendanceStatus.clockIn)}
                    </Typography>
                  )}
                  {attendanceStatus.clockOut && (
                    <Typography variant="body2">
                      Clock Out: {formatTime(attendanceStatus.clockOut)}
                    </Typography>
                  )}
                  {(Number(attendanceStatus.totalHours) || 0) > 0 && (
                    <Typography variant="body2">
                      Total Hours: {Number(attendanceStatus.totalHours).toFixed(1)}h
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2">Loading...</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {attendanceStatus?.status === 'not_clocked_in' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => openClockDialog('in')}
                  sx={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { background: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Clock In
                </Button>
              )}
              {attendanceStatus?.status === 'clocked_in' && (
                <Button
                  variant="contained"
                  startIcon={<Stop />}
                  onClick={() => openClockDialog('out')}
                  sx={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { background: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Clock Out
                </Button>
              )}
              <IconButton onClick={fetchAttendanceStatus} sx={{ color: 'white' }}>
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {attendanceRecords.filter(record => record.status === 'present').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {attendanceRecords.reduce((total, record) => total + (Number(record.totalHours) || 0), 0).toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Cancel color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {attendanceRecords.filter(record => record.status === 'late').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <History color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {attendanceRecords.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance History */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Attendance History
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Clock In</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Clock Out</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Total Hours</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No attendance records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceRecords.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(record.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(record.clockIn)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(record.clockOut)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {Number(record.totalHours).toFixed(1)}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          size="small"
                          color={getStatusColor(record.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary">
                            {record.location || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Clock In/Out Dialog */}
      <Dialog open={clockDialogOpen} onClose={() => setClockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {clockAction === 'in' ? 'Clock In' : 'Clock Out'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {clockAction === 'in' && (
            <TextField
              label="Location (Optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              placeholder="e.g., Office, Remote, Client Site"
            />
          )}
          <TextField
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Any additional notes..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setClockDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={clockAction === 'in' ? handleClockIn : handleClockOut}
            variant="contained"
            disabled={actionLoading}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {actionLoading ? <CircularProgress size={20} /> : (clockAction === 'in' ? 'Clock In' : 'Clock Out')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Attendance;
