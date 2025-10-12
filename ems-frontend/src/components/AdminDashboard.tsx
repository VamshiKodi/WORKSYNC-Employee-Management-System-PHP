import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Modal,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Autocomplete,
  InputAdornment,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Unstable_Grid2';
import Person from '@mui/icons-material/Person';
import Email from '@mui/icons-material/Email';
import GroupAdd from '@mui/icons-material/GroupAdd';
import Group from '@mui/icons-material/Group';
import Business from '@mui/icons-material/Business';
import WorkOutline from '@mui/icons-material/WorkOutline';
import { useAuth } from '../contexts/AuthContext';
import { employeesAPI, departmentsAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Full(er) AdminDashboard: list employees, add modal, and charts
const AdminDashboard: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  // Employees state
  const [employees, setEmployees] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Add employee modal and form
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<{ [k: string]: string }>({});
  const [newEmployee, setNewEmployee] = React.useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    username: '',
    password: '',
    role: 'employee'
  });

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Departments overview (mock from departmentsAPI)
  const [deptOverview, setDeptOverview] = React.useState<{ departments: any[]; attendanceSummary: any[] } | null>(null);
  const [deptLoading, setDeptLoading] = React.useState<boolean>(false);
  const [deptError, setDeptError] = React.useState<string | null>(null);

  // Edit/Delete state
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any | null>(null);
  const [editEmployee, setEditEmployee] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
  });
  const [credUsername, setCredUsername] = React.useState('');
  const [credPassword, setCredPassword] = React.useState('');
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const departmentOptions = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Customer Support',
    'Product',
  ];
  const positionOptionsMap: Record<string, string[]> = {
    Engineering: ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'QA Engineer', 'DevOps Engineer', 'Engineering Manager'],
    Marketing: ['Marketing Manager', 'Content Strategist', 'SEO Specialist', 'Growth Marketer'],
    Sales: ['Account Executive', 'Sales Development Rep', 'Sales Manager'],
    Finance: ['Accountant', 'Financial Analyst', 'Controller'],
    Operations: ['Operations Associate', 'Operations Manager'],
    'Human Resources': ['HR Generalist', 'Recruiter', 'HR Manager'],
    'Customer Support': ['Support Specialist', 'Support Lead'],
    Product: ['Product Manager', 'Product Designer', 'UX Researcher'],
  };

  const getPositionOptions = (dept: string) => positionOptionsMap[dept] || [];
  const companyDomain = 'worksync.com';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesAPI.getAll();
      // Normalize backend shapes: {employees: []} or {data: []}
      const list = Array.isArray((data as any).employees)
        ? (data as any).employees
        : Array.isArray((data as any).data)
        ? (data as any).data
        : [];
      setEmployees(list);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) fetchEmployees();
  }, [isAuthenticated]);

  React.useEffect(() => {
    const loadDept = async () => {
      try {
        setDeptLoading(true);
        const data = await departmentsAPI.getOverview();
        // Normalize keys from mock: departments: [{ name, count }], attendanceSummary: [{ name, count }]
        const departments = (data.departments || []).map((d: any) => ({ department: d.department ?? d.name, count: d.count }));
        const attendanceSummary = (data.attendanceSummary || []).map((a: any) => ({ status: a.status ?? a.name, count: a.count, color: a.color }));
        setDeptOverview({ departments, attendanceSummary });
      } catch (e: any) {
        setDeptError(e.message || 'Failed to load department overview');
      } finally {
        setDeptLoading(false);
      }
    };
    loadDept();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const suggestedUsername = (first: string, last: string) => {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (!f && !l) return '';
    return (f.charAt(0) + l).toLowerCase().replace(/\s+/g, '');
  };

  const openEdit = (emp: any) => {
    setSelectedEmployee(emp);
    setEditEmployee({
      firstName: emp.firstName ?? '',
      lastName: emp.lastName ?? '',
      email: emp.email ?? '',
      department: emp.department ?? '',
      position: emp.position ?? '',
    });
    setCredUsername('');
    setCredPassword('');
    setEditOpen(true);
  };

  const handleEditFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      await employeesAPI.update(selectedEmployee.id ?? selectedEmployee._id, editEmployee);
      if (credUsername || credPassword) {
        await employeesAPI.updateCredentials(selectedEmployee.id ?? selectedEmployee._id, {
          ...(credUsername ? { username: credUsername } : {}),
          ...(credPassword ? { password: credPassword } : {}),
        });
      }
      setEditOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
      setSnackbarSeverity('success');
      setSnackbarMessage(credUsername || credPassword ? 'Employee and credentials updated' : 'Employee updated');
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(err.message || 'Failed to update employee');
      setSnackbarOpen(true);
    }
  };

  const openDelete = (emp: any) => {
    setSelectedEmployee(emp);
    setDeleteOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      setDeleteLoading(true);
      await employeesAPI.delete(selectedEmployee.id ?? selectedEmployee._id);
      setDeleteOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
      setSnackbarSeverity('success');
      setSnackbarMessage('Employee deleted');
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(err.message || 'Failed to delete employee');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: { [k: string]: string } = {};
    if (!newEmployee.firstName) errors.firstName = 'First name is required';
    if (!newEmployee.lastName) errors.lastName = 'Last name is required';
    if (!newEmployee.email) errors.email = 'Email is required';
    if (!newEmployee.department) errors.department = 'Department is required';
    if (!newEmployee.position) errors.position = 'Position is required';
    if (!newEmployee.username) errors.username = 'Username is required';
    if (!newEmployee.password || newEmployee.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setSnackbarSeverity('warning');
      setSnackbarMessage('Please fix form errors and try again');
      setSnackbarOpen(true);
      return;
    }
    try {
      const res = await employeesAPI.create(newEmployee);
      setIsModalOpen(false);
      setNewEmployee({ employeeId: '', firstName: '', lastName: '', email: '', department: '', position: '', username: '', password: '', role: 'employee' });
      setFormErrors({});
      setSnackbarSeverity('success');
      setSnackbarMessage('Employee added successfully');
      setSnackbarOpen(true);
      fetchEmployees();
    } catch (err: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(err.message || 'Failed to add employee');
      setSnackbarOpen(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>WS</Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
              {user?.role === 'admin' ? 'Admin Dashboard' : 
               user?.role === 'hr' ? 'HR Dashboard' : 
               'Employee Dashboard'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {(user?.role === 'admin' || user?.role === 'hr') && (
              <Button
                variant="contained"
                onClick={openModal}
                startIcon={<GroupAdd />}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                }}
              >
                Add Employee
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                  color: '#dc2626',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Quick stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Card elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Group sx={{ fontSize: 40, color: '#6366f1' }} />
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>Employees</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>{employees.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ fontSize: 40, color: '#8b5cf6' }} />
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>Departments</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{departmentOptions.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <WorkOutline sx={{ fontSize: 40, color: '#22c55e' }} />
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>Open Roles</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{Object.values(positionOptionsMap).flat().length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Department Charts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
          <Card elevation={0} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>Headcount by Department</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(deptOverview?.departments || []).map((d) => ({ department: d.department, count: d.count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Employees" fill="#6366f1" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
          <Card elevation={0} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>Attendance (30 days)</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="count" data={(deptOverview?.attendanceSummary || [])} outerRadius={100} label>
                    {(deptOverview?.attendanceSummary || []).map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={["#22c55e","#ef4444","#f59e0b","#06b6d4","#8b5cf6"][idx % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Box>

        {/* Employees table */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>Employees</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((e) => (
                    <TableRow key={e._id || e.id} hover>
                      <TableCell>{e.employeeId || e.employee_id || '-'}</TableCell>
                      <TableCell>{`${e.firstName || e.first_name || ''} ${e.lastName || e.last_name || ''}`.trim()}</TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>{e.department}</TableCell>
                      <TableCell>{e.position}</TableCell>
                      <TableCell align="right">
                        {(user?.role === 'admin' || user?.role === 'hr') ? (
                          <>
                            <Button size="small" onClick={() => openEdit(e)} startIcon={<EditIcon fontSize="small" />}>Edit</Button>
                            <Button size="small" color="error" onClick={() => openDelete(e)} startIcon={<DeleteIcon fontSize="small" />} sx={{ ml: 1 }}>Delete</Button>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">View Only</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Add Employee Modal */}
        <Modal open={isModalOpen} onClose={closeModal}>
          <Box sx={{ position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 640, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>Add New Employee</Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>Fill in the details below.</Typography>
            <form onSubmit={handleAddEmployee}>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField name="firstName" label="First Name" value={newEmployee.firstName} onChange={handleInputChange} fullWidth required error={!!formErrors.firstName} helperText={formErrors.firstName} />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField name="lastName" label="Last Name" value={newEmployee.lastName} onChange={handleInputChange} fullWidth required error={!!formErrors.lastName} helperText={formErrors.lastName} />
                </Grid>
                <Grid xs={12}>
                  <TextField name="email" label="Work Email" type="email" value={newEmployee.email} onChange={handleInputChange} fullWidth required error={!!formErrors.email} helperText={formErrors.email} />
                </Grid>
                <Grid xs={12} md={6}>
                  <Autocomplete
                    options={departmentOptions}
                    value={newEmployee.department}
                    onChange={(_, val) => { setNewEmployee(prev => ({ ...prev, department: val || '', position: '' })); setFormErrors(prev => ({ ...prev, department: '' })); }}
                    freeSolo
                    renderInput={(params) => <TextField {...params} label="Department" required error={!!formErrors.department} helperText={formErrors.department} />}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Autocomplete
                    options={getPositionOptions(newEmployee.department)}
                    value={newEmployee.position}
                    onChange={(_, val) => { setNewEmployee(prev => ({ ...prev, position: val || '' })); setFormErrors(prev => ({ ...prev, position: '' })); }}
                    freeSolo
                    disabled={!newEmployee.department}
                    renderInput={(params) => <TextField {...params} label="Position" required error={!!formErrors.position} helperText={formErrors.position} />}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField name="username" label="Username" value={newEmployee.username} onChange={handleInputChange} fullWidth required error={!!formErrors.username} helperText={formErrors.username || `Suggested: ${suggestedUsername(newEmployee.firstName, newEmployee.lastName) || '—'}`} />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField name="password" label="Password" type="password" value={newEmployee.password} onChange={handleInputChange} fullWidth required error={!!formErrors.password} helperText={formErrors.password || 'Min. 6 characters'} />
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={newEmployee.role}
                      label="Role"
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <MenuItem value="employee">Employee</MenuItem>
                      <MenuItem value="hr">HR (Human Resources)</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button onClick={closeModal} sx={{ mr: 1 }}>Cancel</Button>
                  <Button type="submit" variant="contained" startIcon={<GroupAdd />}>Submit</Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Modal>

        {/* Edit Employee Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Employee</DialogTitle>
          <form onSubmit={handleUpdateEmployee}>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField name="firstName" label="First Name" value={editEmployee.firstName} onChange={handleEditFieldChange} fullWidth />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField name="lastName" label="Last Name" value={editEmployee.lastName} onChange={handleEditFieldChange} fullWidth />
                </Grid>
                <Grid xs={12}>
                  <TextField name="email" label="Email" value={editEmployee.email} onChange={handleEditFieldChange} fullWidth />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField name="department" label="Department" value={editEmployee.department} onChange={handleEditFieldChange} fullWidth />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField name="position" label="Position" value={editEmployee.position} onChange={handleEditFieldChange} fullWidth />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Update Login (optional)</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField label="New Username" value={credUsername} onChange={(e) => setCredUsername(e.target.value)} fullWidth />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField label="New Password" type="password" value={credPassword} onChange={(e) => setCredPassword(e.target.value)} fullWidth />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogContent dividers>
            <Typography>Are you sure you want to delete this employee?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteEmployee} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminDashboard;


