import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { employeesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const EmployeeList: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
    address: '',
    username: '',
    password: '',
    role: 'employee'
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  // Department and position options
  const departments = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Customer Support',
    'IT Support',
    'Management',
    'Legal',
    'Research & Development'
  ];

  const positions = {
    'Engineering': ['Software Engineer', 'Senior Software Engineer', 'Lead Engineer', 'Engineering Manager', 'DevOps Engineer', 'QA Engineer'],
    'Human Resources': ['HR Specialist', 'HR Manager', 'Recruiter', 'HR Director', 'Benefits Coordinator'],
    'Marketing': ['Marketing Specialist', 'Marketing Manager', 'Content Creator', 'Digital Marketing Manager', 'Brand Manager'],
    'Sales': ['Sales Representative', 'Sales Manager', 'Account Executive', 'Sales Director', 'Business Development'],
    'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'CFO', 'Controller'],
    'Operations': ['Operations Manager', 'Operations Analyst', 'Project Manager', 'Operations Director'],
    'Customer Support': ['Customer Support Rep', 'Support Manager', 'Customer Success Manager'],
    'IT Support': ['IT Support Specialist', 'System Administrator', 'IT Manager', 'Network Administrator'],
    'Management': ['Team Lead', 'Department Manager', 'VP', 'CEO', 'COO'],
    'Legal': ['Legal Counsel', 'Legal Assistant', 'Compliance Officer'],
    'Research & Development': ['Research Scientist', 'R&D Manager', 'Product Manager']
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Filter employees based on search query
    if (searchQuery) {
      const filtered = employees.filter(emp =>
        emp.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchQuery, employees]);

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll();
      setEmployees(response.data || []);
      setFilteredEmployees(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await employeesAPI.delete(id.toString());
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: '',
      hireDate: '',
      address: '',
      username: '',
      password: '',
      role: 'employee'
    });
    setFormErrors({});
  };

  const openEditModal = (employee: any) => {
    setEditingEmployee(employee);
    setNewEmployee({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || '',
      position: employee.position || '',
      salary: employee.salary || '',
      hireDate: employee.hireDate || '',
      address: employee.address || '',
      username: employee.username || '',
      password: '', // Don't pre-fill password for security
      role: employee.role || 'employee'
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: '',
      hireDate: '',
      address: '',
      username: '',
      password: '',
      role: 'employee'
    });
    setFormErrors({});
  };

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
    
    // Validate email format
    if (newEmployee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone format (optional but if provided, should be valid)
    if (newEmployee.phone && !/^[+]?[1-9][\d]{0,15}$/.test(newEmployee.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Validate salary (optional but if provided, should be numeric)
    if (newEmployee.salary && isNaN(Number(newEmployee.salary))) {
      errors.salary = 'Salary must be a valid number';
    }
    
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setSnackbarSeverity('warning');
      setSnackbarMessage('Please fix form errors and try again');
      setSnackbarOpen(true);
      return;
    }
    try {
      await employeesAPI.create(newEmployee);
      closeModal();
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

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: { [k: string]: string } = {};
    if (!newEmployee.firstName) errors.firstName = 'First name is required';
    if (!newEmployee.lastName) errors.lastName = 'Last name is required';
    if (!newEmployee.email) errors.email = 'Email is required';
    if (!newEmployee.department) errors.department = 'Department is required';
    if (!newEmployee.position) errors.position = 'Position is required';
    if (!newEmployee.username) errors.username = 'Username is required';
    
    // Password is optional for edit (only validate if provided)
    if (newEmployee.password && newEmployee.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Validate email format
    if (newEmployee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone format (optional but if provided, should be valid)
    if (newEmployee.phone && !/^[+]?[1-9][\d]{0,15}$/.test(newEmployee.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Validate salary (optional but if provided, should be numeric)
    if (newEmployee.salary && isNaN(Number(newEmployee.salary))) {
      errors.salary = 'Salary must be a valid number';
    }
    
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setSnackbarSeverity('warning');
      setSnackbarMessage('Please fix form errors and try again');
      setSnackbarOpen(true);
      return;
    }
    try {
      // Remove password from update if empty
      const { password, ...updateData } = newEmployee;
      const finalUpdateData = password ? { ...updateData, password } : updateData;
      
      await employeesAPI.update(editingEmployee.id.toString(), finalUpdateData);
      closeEditModal();
      setSnackbarSeverity('success');
      setSnackbarMessage('Employee updated successfully');
      setSnackbarOpen(true);
      fetchEmployees();
    } catch (err: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(err.message || 'Failed to update employee');
      setSnackbarOpen(true);
    }
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Employee List
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Manage all employees in the system
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {isAdminOrHR && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openModal}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b3fa0 100%)',
              },
            }}
          >
            Add New Employee
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Employee ID</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Position</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                {isAdminOrHR && (
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdminOrHR ? 7 : 6} align="center" sx={{ py: 4 }}>
                    <PersonIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery ? 'No employees found matching your search' : 'No employees found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                        {employee.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: '#94a3b8' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {employee.firstName} {employee.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.department}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                          color: '#667eea',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status || 'Active'}
                        size="small"
                        color={employee.status === 'Active' || !employee.status ? 'success' : 'default'}
                      />
                    </TableCell>
                    {isAdminOrHR && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditModal(employee)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredEmployees.length} of {employees.length} employees
        </Typography>
      </Box>

      {/* Add Employee Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Add New Employee
          </Typography>
        </DialogTitle>
        <form onSubmit={handleAddEmployee}>
          <DialogContent>
            {/* Personal Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                name="firstName"
                label="First Name"
                value={newEmployee.firstName}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
              <TextField
                name="lastName"
                label="Last Name"
                value={newEmployee.lastName}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                name="email"
                label="Work Email"
                type="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <TextField
                name="phone"
                label="Phone Number"
                value={newEmployee.phone}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.phone}
                helperText={formErrors.phone || 'Optional'}
              />
            </Box>
            
            {/* Work Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2, mt: 3 }}>
              Work Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <FormControl fullWidth required error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={newEmployee.department}
                  onChange={(e) => {
                    setNewEmployee(prev => ({ 
                      ...prev, 
                      department: e.target.value,
                      position: '' // Reset position when department changes
                    }));
                    if (formErrors.department) {
                      setFormErrors(prev => ({ ...prev, department: '' }));
                    }
                  }}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
                {formErrors.department && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.department}
                  </Typography>
                )}
              </FormControl>
              <FormControl fullWidth required error={!!formErrors.position}>
                <InputLabel>Position</InputLabel>
                <Select
                  name="position"
                  value={newEmployee.position}
                  onChange={(e) => {
                    setNewEmployee(prev => ({ ...prev, position: e.target.value }));
                    if (formErrors.position) {
                      setFormErrors(prev => ({ ...prev, position: '' }));
                    }
                  }}
                  label="Position"
                  disabled={!newEmployee.department}
                >
                  {newEmployee.department && positions[newEmployee.department as keyof typeof positions]?.map((pos) => (
                    <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                  ))}
                </Select>
                {formErrors.position && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.position}
                  </Typography>
                )}
              </FormControl>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                name="salary"
                label="Salary"
                type="number"
                value={newEmployee.salary}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.salary}
                helperText={formErrors.salary || 'Optional - Annual salary'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                name="hireDate"
                label="Hire Date"
                type="date"
                value={newEmployee.hireDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Optional - Defaults to today"
              />
            </Box>
            
            {/* Address */}
            <TextField
              name="address"
              label="Address"
              value={newEmployee.address}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
              helperText="Optional - Full address"
            />
            
            {/* Login Credentials */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2, mt: 3 }}>
              Login Credentials
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                name="username"
                label="Username"
                value={newEmployee.username}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
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
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={closeModal} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              Add Employee
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={isEditModalOpen} onClose={closeEditModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Edit Employee
          </Typography>
        </DialogTitle>
        <form onSubmit={handleEditEmployee}>
          <DialogContent>
            {/* Personal Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                name="firstName"
                label="First Name"
                value={newEmployee.firstName}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
              <TextField
                name="lastName"
                label="Last Name"
                value={newEmployee.lastName}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                name="email"
                label="Work Email"
                type="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <TextField
                name="phone"
                label="Phone Number"
                value={newEmployee.phone}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.phone}
                helperText={formErrors.phone || 'Optional'}
              />
            </Box>
            
            {/* Work Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2, mt: 3 }}>
              Work Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <FormControl fullWidth required error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={newEmployee.department}
                  onChange={(e) => {
                    setNewEmployee(prev => ({ 
                      ...prev, 
                      department: e.target.value,
                      position: '' // Reset position when department changes
                    }));
                    if (formErrors.department) {
                      setFormErrors(prev => ({ ...prev, department: '' }));
                    }
                  }}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
                {formErrors.department && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.department}
                  </Typography>
                )}
              </FormControl>
              <FormControl fullWidth required error={!!formErrors.position}>
                <InputLabel>Position</InputLabel>
                <Select
                  name="position"
                  value={newEmployee.position}
                  onChange={(e) => {
                    setNewEmployee(prev => ({ ...prev, position: e.target.value }));
                    if (formErrors.position) {
                      setFormErrors(prev => ({ ...prev, position: '' }));
                    }
                  }}
                  label="Position"
                  disabled={!newEmployee.department}
                >
                  {newEmployee.department && positions[newEmployee.department as keyof typeof positions]?.map((pos) => (
                    <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                  ))}
                </Select>
                {formErrors.position && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.position}
                  </Typography>
                )}
              </FormControl>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                name="salary"
                label="Salary"
                type="number"
                value={newEmployee.salary}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.salary}
                helperText={formErrors.salary || 'Optional - Annual salary'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                name="hireDate"
                label="Hire Date"
                type="date"
                value={newEmployee.hireDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Optional - Defaults to today"
              />
            </Box>
            
            {/* Address */}
            <TextField
              name="address"
              label="Address"
              value={newEmployee.address}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
              helperText="Optional - Full address"
            />
            
            {/* Login Credentials */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2, mt: 3 }}>
              Login Credentials
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                name="username"
                label="Username"
                value={newEmployee.username}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                value={newEmployee.password}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.password}
                helperText={formErrors.password || 'Optional - Leave blank to keep current password'}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={closeEditModal} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              Update Employee
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmployeeList;
