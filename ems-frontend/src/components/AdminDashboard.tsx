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
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Person from '@mui/icons-material/Person';
import Email from '@mui/icons-material/Email';
import GroupAdd from '@mui/icons-material/GroupAdd';
import Group from '@mui/icons-material/Group';
import Business from '@mui/icons-material/Business';
import WorkOutline from '@mui/icons-material/WorkOutline';
import { employeesAPI } from '../services/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 640,
  bgcolor: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  borderRadius: '16px',
  p: 4,
};

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
}

const AdminDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    username: '',
    password: ''
  });

  // Edit/Delete state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: ''
  });
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Form errors
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});

  // Suggestions (could be fetched from backend later)
  const departmentOptions = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Customer Support',
    'Product'
  ];

  const positionOptionsMap: Record<string, string[]> = {
    Engineering: ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'QA Engineer', 'DevOps Engineer', 'Engineering Manager'],
    Marketing: ['Marketing Manager', 'Content Strategist', 'SEO Specialist', 'Growth Marketer'],
    Sales: ['Account Executive', 'Sales Development Rep', 'Sales Manager'],
    Finance: ['Accountant', 'Financial Analyst', 'Controller'],
    Operations: ['Operations Associate', 'Operations Manager'],
    'Human Resources': ['HR Generalist', 'Recruiter', 'HR Manager'],
    'Customer Support': ['Support Specialist', 'Support Lead'],
    Product: ['Product Manager', 'Product Designer', 'UX Researcher']
  };

  const openEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditEmployee({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      position: emp.position,
    });
    setFormErrors({});
    setCredUsername('');
    setCredPassword('');
    setEditOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    // basic validation
    const errors: { [k: string]: string } = {};
    if (!editEmployee.firstName) errors.firstName = 'First name is required';
    if (!editEmployee.lastName) errors.lastName = 'Last name is required';
    if (!editEmployee.email) errors.email = 'Email is required';
    if (!editEmployee.department) errors.department = 'Department is required';
    if (!editEmployee.position) errors.position = 'Position is required';
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setSnackbarSeverity('warning');
      setSnackbarMessage('Please fix form errors and try again');
      setSnackbarOpen(true);
      return;
    }
    try {
      await employeesAPI.update(selectedEmployee._id, editEmployee);
      // If admin provided new username/password, update credentials too
      if (credUsername || credPassword) {
        await employeesAPI.updateCredentials(selectedEmployee._id, {
          ...(credUsername ? { username: credUsername } : {}),
          ...(credPassword ? { password: credPassword } : {}),
        });
      }
      setEditOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
      setSnackbarSeverity('success');
      setSnackbarMessage(
        credUsername || credPassword
          ? 'Employee and credentials updated successfully'
          : 'Employee updated successfully'
      );
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarOpen(true);
    }
  };

  const openDelete = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDeleteOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      setDeleteLoading(true);
      await employeesAPI.delete(selectedEmployee._id);
      setDeleteOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
      setSnackbarSeverity('success');
      setSnackbarMessage('Employee deleted successfully');
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getPositionOptions = (dept: string) => positionOptionsMap[dept] || [];

  const companyDomain = 'worksync.com';
  const suggestedUsername = (first: string, last: string) => {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (!f && !l) return '';
    return (f.charAt(0) + l).toLowerCase().replace(/\s+/g, '');
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesAPI.getAll();
      setEmployees(data.employees || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Basic validation
    const errors: { [k: string]: string } = {};
    if (!newEmployee.firstName) errors.firstName = 'First name is required';
    if (!newEmployee.lastName) errors.lastName = 'Last name is required';
    if (!newEmployee.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!newEmployee.department) errors.department = 'Department is required';
    if (!newEmployee.position) errors.position = 'Position is required';
    if (!newEmployee.username) errors.username = 'Username is required';
    if (!newEmployee.password) {
      errors.password = 'Password is required';
    } else if (newEmployee.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setSnackbarSeverity('warning');
      setSnackbarMessage('Please fix form errors and try again');
      setSnackbarOpen(true);
      return;
    }
    try {
      const data = await employeesAPI.create(newEmployee);

      setIsModalOpen(false);
      fetchEmployees(); // Refresh employee list
      setNewEmployee({ employeeId: '', firstName: '', lastName: '', email: '', department: '', position: '', username: '', password: '' });
      setFormErrors({});
      setSnackbarSeverity('success');
      setSnackbarMessage(`Employee added successfully! They can now log in with their new credentials.`);
      setSnackbarOpen(true);

    } catch (err: any) {
      setError(err.message);
      setSnackbarSeverity('error');
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarOpen(true);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error && !employees.length) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ minHeight: '100vh' }} className="page-transition">
      {/* Cinematic Background Effects */}
      <div className="parallax-bg" />
      <div className="interactive-bg" />
      <div className="floating-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                WS
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
              Admin Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained"
              onClick={openModal}
              startIcon={<GroupAdd />}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
              }}
            >
              Add Employee
            </Button>
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

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome / KPIs banner */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '220px',
              height: '220px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
            },
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            Team Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Add and manage employees, departments, and positions.
          </Typography>
        </Paper>

        {/* Quick stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Card elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Group sx={{ fontSize: 40, color: '#6366f1' }} />
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>Employees</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>{employees.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ fontSize: 40, color: '#8b5cf6' }} />
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>Departments</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{departmentOptions.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <WorkOutline sx={{ fontSize: 40, color: '#22c55e' }} />
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>Open Roles</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{Object.values(positionOptionsMap).flat().length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Employee table */}
        <Paper elevation={0} sx={{ p: 3, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>Employees</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Employee ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id} hover sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'translateX(2px)' } }}>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="Edit" onClick={() => openEdit(employee)} size="small" sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton aria-label="Delete" onClick={() => openDelete(employee)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add Employee Modal */}
        <Modal open={isModalOpen} onClose={closeModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>Add New Employee</Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Fill in the details below. A secure password will be generated automatically.
            </Typography>
            <form onSubmit={handleAddEmployee}>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <TextField
                    name="employeeId"
                    label="Employee ID (Optional)"
                    value={newEmployee.employeeId}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.employeeId}
                    helperText={formErrors.employeeId || 'Leave blank to auto-generate (e.g., EMP1234567890)'}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    value={newEmployee.firstName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.firstName}
                    helperText={formErrors.firstName || 'Given name'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    name="lastName"
                    label="Last Name"
                    value={newEmployee.lastName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.lastName}
                    helperText={formErrors.lastName || 'Family name'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    name="email"
                    label="Work Email"
                    type="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.email}
                    helperText={formErrors.email || `Use company domain e.g. firstname.lastname@${companyDomain}`}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Autocomplete
                    options={departmentOptions}
                    value={newEmployee.department}
                    onChange={(_, val) => {
                      setNewEmployee(prev => ({ ...prev, department: val || '', position: '' })); // Reset position on department change
                      setFormErrors(prev => ({ ...prev, department: '' }));
                    }}
                    freeSolo
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        required
                        error={!!formErrors.department}
                        helperText={formErrors.department || 'Start typing to see suggestions'}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Autocomplete
                    options={getPositionOptions(newEmployee.department)}
                    value={newEmployee.position}
                    onChange={(_, val) => {
                      setNewEmployee(prev => ({ ...prev, position: val || '' }));
                      setFormErrors(prev => ({ ...prev, position: '' }));
                    }}
                    freeSolo
                    disabled={!newEmployee.department}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Position"
                        required
                        error={!!formErrors.position}
                        helperText={formErrors.position || (newEmployee.department ? `Common roles in ${newEmployee.department}` : 'Select a department first')}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 2 }}>User Credentials</Divider>
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    name="username"
                    label="Username"
                    value={newEmployee.username}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.username}
                    helperText={formErrors.username || 'Unique username for login'}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    name="password"
                    label="Password"
                    type="password"
                    value={newEmployee.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.password}
                    helperText={formErrors.password || 'Min. 6 characters'}
                  />
                </Grid>
                <Grid xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Suggested username:</Typography>
                    <Chip
                      label={suggestedUsername(newEmployee.firstName, newEmployee.lastName) || '—'}
                      color="default"
                      variant="outlined"
                      size="small"
                    />
                    {suggestedUsername(newEmployee.firstName, newEmployee.lastName) && (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Email: {`${suggestedUsername(newEmployee.firstName, newEmployee.lastName)}@${companyDomain}`}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button onClick={closeModal} sx={{ mr: 1, color: '#64748b' }}>Cancel</Button>
                  <Button type="submit" variant="contained" startIcon={<GroupAdd />} sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                  }}>
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Modal>

        {/* Edit Employee Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>Edit Employee</DialogTitle>
          <DialogContent dividers>
            <Box component="form" onSubmit={handleUpdateEmployee} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Employee ID"
                    value={editEmployee.employeeId}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, employeeId: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="First Name"
                    value={editEmployee.firstName}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                    fullWidth
                    required
                    error={!!formErrors.firstName}
                    helperText={formErrors.firstName}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Last Name"
                    value={editEmployee.lastName}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                    fullWidth
                    required
                    error={!!formErrors.lastName}
                    helperText={formErrors.lastName}
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    value={editEmployee.email}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, email: e.target.value }))}
                    fullWidth
                    required
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Autocomplete
                    options={departmentOptions}
                    value={editEmployee.department}
                    onChange={(_, val) => setEditEmployee(prev => ({ ...prev, department: val || '', position: '' }))}
                    freeSolo
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        required
                        error={!!formErrors.department}
                        helperText={formErrors.department}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Autocomplete
                    options={getPositionOptions(editEmployee.department)}
                    value={editEmployee.position}
                    onChange={(_, val) => setEditEmployee(prev => ({ ...prev, position: val || '' }))}
                    freeSolo
                    disabled={!editEmployee.department}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Position"
                        required
                        error={!!formErrors.position}
                        helperText={formErrors.position}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="New Username (optional)"
                    value={credUsername}
                    onChange={(e) => setCredUsername(e.target.value)}
                    fullWidth
                    placeholder="Leave blank to keep current"
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="New Password (optional)"
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    type="password"
                    fullWidth
                    placeholder="Leave blank to keep current"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
            <Button onClick={handleUpdateEmployee} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>Delete Employee</DialogTitle>
          <DialogContent dividers>
            <Typography>
              Are you sure you want to delete {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'this employee'}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)} disabled={deleteLoading} sx={{ color: '#64748b' }}>Cancel</Button>
            <Button onClick={handleDeleteEmployee} color="error" variant="contained" disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for success/error feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={10000} // Increased duration for credentials
          onClose={(_, reason) => {
            if (reason === 'clickaway') return;
            setSnackbarOpen(false);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
