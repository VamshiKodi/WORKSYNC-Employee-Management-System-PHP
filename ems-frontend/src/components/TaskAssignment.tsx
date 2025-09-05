import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
}

const TaskAssignment: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employeeId: '',
    priority: 'medium',
    dueDate: '',
  });

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockEmployees: Employee[] = [
      { id: 'EMP001', name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', position: 'Software Developer' },
      { id: 'EMP002', name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Marketing', position: 'Marketing Manager' },
      { id: 'EMP003', name: 'Mike Johnson', email: 'mike.johnson@company.com', department: 'Sales', position: 'Sales Representative' },
      { id: 'EMP004', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', department: 'HR', position: 'HR Specialist' },
      { id: 'EMP005', name: 'David Brown', email: 'david.brown@company.com', department: 'Engineering', position: 'QA Engineer' },
    ];

    const mockTasks: Task[] = [
      {
        id: 'TASK001',
        title: 'Update website content',
        description: 'Update the company website with new product information',
        assignedTo: 'EMP002',
        assignedBy: 'Admin',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2024-01-15',
        createdAt: '2024-01-10',
      },
      {
        id: 'TASK002',
        title: 'Bug fix in login system',
        description: 'Fix the authentication bug in the user login system',
        assignedTo: 'EMP001',
        assignedBy: 'Admin',
        status: 'completed',
        priority: 'urgent',
        dueDate: '2024-01-12',
        createdAt: '2024-01-08',
      },
    ];

    setEmployees(mockEmployees);
    setTasks(mockTasks);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.employeeId || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newTask: Task = {
        id: `TASK${Date.now()}`,
        title: formData.title,
        description: formData.description,
        assignedTo: formData.employeeId,
        assignedBy: 'Admin',
        status: 'pending',
        priority: formData.priority as Task['priority'],
        dueDate: formData.dueDate,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setTasks(prev => [newTask, ...prev]);
      setSuccess('Task assigned successfully!');
      setFormData({
        title: '',
        description: '',
        employeeId: '',
        priority: 'medium',
        dueDate: '',
      });
      setOpenDialog(false);
    } catch (error) {
      setError('Failed to assign task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" sx={{ mb: 3, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
        Task Assignment
      </Typography>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Task Assignment Form */}
        <Box sx={{ flex: { xs: 1, md: '0 0 33.333%' } }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(236, 240, 241, 0.8)',
              boxShadow: '0 8px 32px rgba(44, 62, 80, 0.1)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
              Assign New Task
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setOpenDialog(true)}
              sx={{
                py: 2,
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                fontSize: '1.1rem',
                letterSpacing: '0.5px',
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(44, 62, 80, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(44, 62, 80, 0.4)',
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                },
              }}
            >
              + Assign Task
            </Button>

            {/* Employee List */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#2c3e50' }}>
              Available Employees
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {employees.map((employee) => (
                <Card
                  key={employee.id}
                  sx={{
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(236, 240, 241, 0.6)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(44, 62, 80, 0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                      {employee.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>
                      ID: {employee.id}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      {employee.position} • {employee.department}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Task List */}
        <Box sx={{ flex: { xs: 1, md: '0 0 66.667%' } }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(236, 240, 241, 0.8)',
              boxShadow: '0 8px 32px rgba(44, 62, 80, 0.1)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
              Assigned Tasks
            </Typography>

            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(236, 240, 241, 0.6)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(44, 62, 80, 0.15)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 2 }}>
                      {task.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                          Assigned to: {getEmployeeName(task.assignedTo)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Task Assignment Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
          Assign New Task
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2c3e50',
                      borderWidth: 2,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2c3e50',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2c3e50',
                      borderWidth: 2,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2c3e50',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <FormControl fullWidth required>
                  <InputLabel>Assign to Employee</InputLabel>
                  <Select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleSelectChange}
                    label="Assign to Employee"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2c3e50',
                      },
                    }}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2c3e50',
                        borderWidth: 2,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2c3e50',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  label="Priority"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2c3e50',
                    },
                  }}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              sx={{
                color: '#7f8c8d',
                borderColor: '#7f8c8d',
                '&:hover': {
                  borderColor: '#2c3e50',
                  color: '#2c3e50',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(44, 62, 80, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)',
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                },
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Assign Task'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TaskAssignment; 