import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { leavesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  // New leave request form
  const [newRequest, setNewRequest] = useState({
    leaveType: 'Sick Leave',
    startDate: null as Date | null,
    endDate: null as Date | null,
    reason: '',
  });

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await leavesAPI.getAll();
      setLeaveRequests(response.data || []);
    } catch (error: any) {
      console.error('Error fetching leave requests:', error);
      setSnackbarMessage(error.message || 'Failed to fetch leave requests');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Handle submit new leave request
  const handleSubmitRequest = async () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      setSnackbarMessage('Please fill in all fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const payload = {
        leaveType: newRequest.leaveType,
        startDate: newRequest.startDate.toISOString().split('T')[0],
        endDate: newRequest.endDate.toISOString().split('T')[0],
        reason: newRequest.reason,
      };

      await leavesAPI.create(payload);
      
      setSnackbarMessage('Leave request submitted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowNewRequestDialog(false);
      setNewRequest({
        leaveType: 'Sick Leave',
        startDate: null,
        endDate: null,
        reason: '',
      });
      fetchLeaveRequests();
      
      // Trigger event to update sidebar badge
      window.dispatchEvent(new Event('leaveRequestUpdated'));
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to submit leave request');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle approve leave request
  const handleApprove = async (id: number) => {
    try {
      await leavesAPI.approve(id);
      setSnackbarMessage('Leave request approved!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchLeaveRequests();
      
      // Trigger event to update sidebar badge
      window.dispatchEvent(new Event('leaveRequestUpdated'));
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to approve leave request');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle reject leave request
  const handleReject = async (id: number) => {
    try {
      await leavesAPI.reject(id);
      setSnackbarMessage('Leave request rejected');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      fetchLeaveRequests();
      
      // Trigger event to update sidebar badge
      window.dispatchEvent(new Event('leaveRequestUpdated'));
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to reject leave request');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle delete leave request
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) {
      return;
    }

    try {
      await leavesAPI.delete(id);
      setSnackbarMessage('Leave request deleted');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      fetchLeaveRequests();
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to delete leave request');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffffff', mb: 1 }}>
              Leave Requests
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#e2e8f0' }}>
              {isAdminOrHR ? 'Manage employee leave requests' : 'View and submit your leave requests'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowNewRequestDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
            }}
          >
            New Leave Request
          </Button>
        </Box>

        {/* Leave Requests Table */}
        <Card sx={{ mb: 4 }}>
          <TableContainer>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
              </Box>
            ) : leaveRequests.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No leave requests found
                </Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    {isAdminOrHR && <TableCell><strong>Employee</strong></TableCell>}
                    <TableCell><strong>Leave Type</strong></TableCell>
                    <TableCell><strong>Start Date</strong></TableCell>
                    <TableCell><strong>End Date</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    {isAdminOrHR && <TableCell><strong>Reviewed By</strong></TableCell>}
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      {isAdminOrHR && (
                        <TableCell>{request.employeeName}</TableCell>
                      )}
                      <TableCell>{request.leaveType}</TableCell>
                      <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.status.toUpperCase()}
                          color={getStatusColor(request.status) as any}
                          size="small"
                        />
                      </TableCell>
                      {isAdminOrHR && (
                        <TableCell>{request.reviewedBy || '-'}</TableCell>
                      )}
                      <TableCell align="right">
                        {isAdminOrHR && request.status === 'pending' ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApprove(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleReject(request.id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : request.status === 'pending' && !isAdminOrHR ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(request.id)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {request.status === 'approved' ? '✓ Approved' : request.status === 'rejected' ? '✗ Rejected' : '-'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Card>

        {/* New Leave Request Dialog */}
        <Dialog open={showNewRequestDialog} onClose={() => setShowNewRequestDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submit New Leave Request</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={newRequest.leaveType}
                  label="Leave Type"
                  onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value })}
                >
                  <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                  <MenuItem value="Vacation">Vacation</MenuItem>
                  <MenuItem value="Personal">Personal</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                label="Start Date"
                value={newRequest.startDate}
                onChange={(date) => setNewRequest({ ...newRequest, startDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <DatePicker
                label="End Date"
                value={newRequest.endDate}
                onChange={(date) => setNewRequest({ ...newRequest, endDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={newRequest.startDate || undefined}
              />

              <TextField
                label="Reason"
                multiline
                rows={4}
                value={newRequest.reason}
                onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                fullWidth
                placeholder="Please provide a reason for your leave request..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNewRequestDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitRequest}>
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default LeaveRequests;
