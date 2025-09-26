import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Avatar,
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
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Event from '@mui/icons-material/Event';
import Person from '@mui/icons-material/Person';
import Home from '@mui/icons-material/Home';
import LocalHospital from '@mui/icons-material/LocalHospital';
import School from '@mui/icons-material/School';
import BeachAccess from '@mui/icons-material/BeachAccess';
import Flight from '@mui/icons-material/Flight';
import MoreVert from '@mui/icons-material/MoreVert';
import Download from '@mui/icons-material/Download';
import Notifications from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// Date Picker imports for @mui/x-date-pickers v6
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SelectChangeEvent } from '@mui/material/Select';
import ModernCorporateColors from '../styles/modern-corporate-colors';
import { leavesAPI } from '../services/api';
import { authAPI } from '../services/api';

// Backend-supported leave types
const leaveTypes = [
  { value: 'annual', label: 'Annual', icon: <BeachAccess />, color: ModernCorporateColors.blueGradient1 },
  { value: 'sick', label: 'Sick Leave', icon: <LocalHospital />, color: ModernCorporateColors.error },
  { value: 'unpaid', label: 'Unpaid', icon: <Person />, color: ModernCorporateColors.warning },
  { value: 'casual', label: 'Casual', icon: <Home />, color: ModernCorporateColors.info },
  { value: 'other', label: 'Other', icon: <School />, color: ModernCorporateColors.success },
];

const LeaveRequests: React.FC = () => {
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state for new request
  const [newRequest, setNewRequest] = useState<{
    type: string;
    startDate: Date | null;
    endDate: Date | null;
    reason: string;
  }>({
    type: '',
    startDate: null,
    endDate: null,
    reason: '',
  });

  // Load current user and requests
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const me = await authAPI.getCurrentUser();
        setCurrentUser(me.user);
        await refreshRequests(me.user);
      } catch (e: any) {
        setError(e.message || 'Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshRequests = async (user?: any) => {
    const role = (user || currentUser)?.role;
    const params: any = {};
    if (filterStatus !== 'all') params.status = filterStatus;
    if (filterType !== 'all') params.type = filterType; // backend route currently filters by status; type filter can be added later
    if (role === 'admin' || role === 'hr') {
      const data = await leavesAPI.list({ status: params.status, page: 1, limit: 50 });
      // normalize to UI shape
      const items = (data.items || []).map((it: any) => ({
        id: it._id,
        employee: {
          name: it.employeeId?.fullName || `${it.employeeId?.firstName || ''} ${it.employeeId?.lastName || ''}`.trim(),
          avatar: (it.employeeId?.firstName || '?')[0] + (it.employeeId?.lastName || '?')[0],
          department: it.employeeId?.department,
          position: it.employeeId?.position,
        },
        type: it.type,
        startDate: new Date(it.startDate),
        endDate: new Date(it.endDate),
        days: it.days,
        reason: it.reason,
        status: it.status,
        submittedDate: new Date(it.createdAt),
        approvedBy: it.approvedBy,
        approvedDate: it.approvedAt ? new Date(it.approvedAt) : null,
      }));
      setRequests(items);
    } else {
      const data = await leavesAPI.getMy({ status: params.status, page: 1, limit: 50 });
      const items = (data.items || []).map((it: any) => ({
        id: it._id,
        employee: {
          name: 'Me',
          avatar: 'ME',
          department: '',
          position: '',
        },
        type: it.type,
        startDate: new Date(it.startDate),
        endDate: new Date(it.endDate),
        days: it.days,
        reason: it.reason,
        status: it.status,
        submittedDate: new Date(it.createdAt),
        approvedBy: it.approvedBy,
        approvedDate: it.approvedAt ? new Date(it.approvedAt) : null,
      }));
      setRequests(items);
    }
  };

  const handleNewRequest = (): void => {
    setFormError(null);
    setShowNewRequestDialog(true);
  };

  const handleSubmitRequest = async (): Promise<void> => {
    setFormError(null);
    if (!newRequest.type || !newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (newRequest.endDate < newRequest.startDate) {
      setFormError('End date cannot be before start date.');
      return;
    }
    try {
      await leavesAPI.create({
        type: newRequest.type,
        startDate: newRequest.startDate.toISOString(),
        endDate: newRequest.endDate.toISOString(),
        reason: newRequest.reason,
      });
      await refreshRequests();
      setShowNewRequestDialog(false);
      setNewRequest({ type: '', startDate: null, endDate: null, reason: '' });
      setFormError(null);
    } catch (e: any) {
      setFormError(e.message || 'Failed to submit request');
    }
  };

  // Note: Pagination/sort handlers removed until pagination UI is added

  // Handle approve action
  const handleApprove = async (requestId: string | number): Promise<void> => {
    try {
      await leavesAPI.approve(String(requestId));
      await refreshRequests();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle reject action
  const handleReject = async (requestId: string | number): Promise<void> => {
    try {
      await leavesAPI.reject(String(requestId));
      await refreshRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return ModernCorporateColors.success;
      case 'rejected': return ModernCorporateColors.error;
      case 'pending': return ModernCorporateColors.warning;
      default: return ModernCorporateColors.info;
    }
  };

  const getTypeIcon = (type: string) => {
    const leaveType = leaveTypes.find(lt => lt.value === type);
    return leaveType ? leaveType.icon : <Event />;
  };

  const getTypeColor = (type: string) => {
    const leaveType = leaveTypes.find(lt => lt.value === type);
    return leaveType ? leaveType.color : ModernCorporateColors.info;
  };

  useEffect(() => {
    // reload when filters change
    const run = async () => {
      try {
        setLoading(true);
        await refreshRequests();
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType]);

  const filteredRequests = requests; // server filters by status; type filter to be supported later

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', background: ModernCorporateColors.lightGray, p: 3 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
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
                  Leave Requests
                </Typography>
                <Typography variant="body1" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                  Manage employee leave requests and approvals
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton 
                    aria-label="Refresh"
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    {/* <Refresh /> */}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton 
                    aria-label="Export"
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleNewRequest}
                  sx={{
                    background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #0077b6 0%, #03045e 100%)' },
                  }}
                >
                  New Request
                </Button>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: ModernCorporateColors.warning }}>
                    {pendingCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                    Pending
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: ModernCorporateColors.success }}>
                    {approvedCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                    Approved
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: ModernCorporateColors.error }}>
                    {rejectedCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                    Rejected
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
            {/* Left Column - Requests List */}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1 }}>
                      Leave Requests
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filterStatus}
                          onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                          label="Status"
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={filterType}
                          onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
                          label="Type"
                        >
                          <MenuItem value="all">All</MenuItem>
                          {leaveTypes.map(type => (
                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </Box>

                {/* Requests Table */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Dates</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Days</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id} sx={{ '&:hover': { background: 'rgba(0, 180, 216, 0.05)' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip
                                avatar={
                                  <Avatar
                                    sx={{
                                      background: `linear-gradient(135deg, ${ModernCorporateColors.blueGradient5} 0%, ${ModernCorporateColors.blueGradient7} 100%)`,
                                      width: 40,
                                      height: 40,
                                    }}
                                  >
                                    {request.employee.avatar}
                                  </Avatar>
                                }
                                label={request.employee.name}
                                sx={{
                                  background: ModernCorporateColors.blueGradient5,
                                  color: 'white',
                                  fontWeight: 600,
                                }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                                  {request.employee.department}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getTypeIcon(request.type)}
                              label={leaveTypes.find(lt => lt.value === request.type)?.label}
                              size="small"
                              sx={{
                                background: getTypeColor(request.type),
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {request.days} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.status}
                              size="small"
                              sx={{
                                background: getStatusColor(request.status),
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {request.status === 'pending' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      aria-label="Approve"
                                      onClick={() => handleApprove(request.id)}
                                      sx={{ color: ModernCorporateColors.success }}
                                    >
                                      <CheckCircle />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      aria-label="Reject"
                                      onClick={() => handleReject(request.id)}
                                      sx={{ color: ModernCorporateColors.error }}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  aria-label="View Details"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowDetailsDialog(true);
                                  }}
                                  sx={{ color: ModernCorporateColors.blueGradient1 }}
                                >
                                  <MoreVert />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Right Column - Quick Actions & Calendar */}
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
                      startIcon={<Add />}
                      fullWidth
                      onClick={handleNewRequest}
                      sx={{
                        borderColor: ModernCorporateColors.blueGradient1,
                        color: ModernCorporateColors.blueGradient1,
                        '&:hover': {
                          borderColor: ModernCorporateColors.blueGradient3,
                          background: 'rgba(0, 180, 216, 0.1)',
                        },
                      }}
                    >
                      Submit Request
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
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
                      Export Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Notifications />}
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
                      Notifications
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Leave Calendar */}
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
                    Leave Calendar
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                      Calendar view coming soon...
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* New Request Dialog */}
          <Dialog open={showNewRequestDialog} onClose={() => { setShowNewRequestDialog(false); setFormError(null); }} maxWidth="md" fullWidth>
            <DialogTitle sx={{ color: ModernCorporateColors.blueGradient1, fontWeight: 600 }}>
              Submit Leave Request
            </DialogTitle>
            <DialogContent>
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={newRequest.type}
                    onChange={(e: SelectChangeEvent) => 
                      setNewRequest({ ...newRequest, type: e.target.value as string })
                    }
                    label="Leave Type"
                  >
                    {leaveTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <DatePicker
                  label="Start Date"
                  value={newRequest.startDate}
                  onChange={(date: Date | null) => setNewRequest({ ...newRequest, startDate: date })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={newRequest.endDate}
                  onChange={(date: Date | null) => setNewRequest({ ...newRequest, endDate: date })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
                <TextField
                  label="Reason"
                  value={newRequest.reason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                    setNewRequest({ ...newRequest, reason: e.target.value })
                  }
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowNewRequestDialog(false)}>Cancel</Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={!newRequest.type || !newRequest.startDate || !newRequest.endDate || !newRequest.reason}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #0077b6 0%, #03045e 100%)' },
                }}
              >
                Submit Request
              </Button>
            </DialogActions>
          </Dialog>

          {/* Request Details Dialog */}
          <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
            {selectedRequest && (
              <>
                <DialogTitle sx={{ color: ModernCorporateColors.blueGradient1, fontWeight: 600 }}>
                  Request Details
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Employee Information
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip
                          avatar={
                            <Avatar
                              sx={{
                                background: `linear-gradient(135deg, ${ModernCorporateColors.blueGradient5} 0%, ${ModernCorporateColors.blueGradient7} 100%)`,
                                width: 60,
                                height: 60,
                              }}
                            >
                              {selectedRequest.employee.avatar}
                            </Avatar>
                          }
                          label={selectedRequest.employee.name}
                          sx={{
                            background: ModernCorporateColors.blueGradient5,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedRequest.employee.position}
                          </Typography>
                          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                            {selectedRequest.employee.department}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Request Information
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray }}>
                            Type:
                          </Typography>
                          <Chip
                            icon={getTypeIcon(selectedRequest.type)}
                            label={leaveTypes.find(lt => lt.value === selectedRequest.type)?.label}
                            size="small"
                            sx={{
                              background: getTypeColor(selectedRequest.type),
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray }}>
                            Status:
                          </Typography>
                          <Chip
                            label={selectedRequest.status}
                            size="small"
                            sx={{
                              background: getStatusColor(selectedRequest.status),
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGray }}>
                            Days:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedRequest.days} days
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Reason
                    </Typography>
                    <Typography variant="body2" sx={{ background: 'rgba(0, 180, 216, 0.1)', p: 2, borderRadius: 1 }}>
                      {selectedRequest.reason}
                    </Typography>
                  </Box>
                  {selectedRequest.rejectionReason && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: ModernCorporateColors.error }}>
                        Rejection Reason
                      </Typography>
                      <Typography variant="body2" sx={{ background: 'rgba(244, 67, 54, 0.1)', p: 2, borderRadius: 1, color: ModernCorporateColors.error }}>
                        {selectedRequest.rejectionReason}
                      </Typography>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleApprove(selectedRequest.id);
                          setShowDetailsDialog(false);
                        }}
                        variant="contained"
                        sx={{
                          background: ModernCorporateColors.success,
                          '&:hover': { background: ModernCorporateColors.success },
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          handleReject(selectedRequest.id);
                          setShowDetailsDialog(false);
                        }}
                        variant="contained"
                        sx={{
                          background: ModernCorporateColors.error,
                          '&:hover': { background: ModernCorporateColors.error },
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveRequests; 