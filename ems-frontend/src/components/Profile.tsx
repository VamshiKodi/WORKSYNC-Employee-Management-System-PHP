import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person,
  Work,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { employeesAPI } from '../services/api';

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!authUser?.employeeId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await employeesAPI.getAll();
        const employee = response.data.find((emp: any) => emp.employeeId === authUser.employeeId);
        if (employee) {
          setEmployeeData(employee);
          setError(null);
        } else {
          // No employee record found, but we can still show user info
          setEmployeeData(null);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
        // Don't set error, just show user info without employee data
        setEmployeeData(null);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [authUser?.employeeId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const displayName = employeeData ? `${employeeData.firstName} ${employeeData.lastName}` : authUser?.username || 'User';
  const userInitials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const roleDisplay = authUser?.role === 'admin' ? 'Administrator' : authUser?.role === 'hr' ? 'HR Manager' : 'Employee';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
        Profile
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: '#64748b' }}>
        Manage your profile, preferences, and account settings
      </Typography>

      {!employeeData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Employee record not found. Showing basic user information.
        </Alert>
      )}

      <Card sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              fontSize: '2rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            {userInitials}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
              {displayName}
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
              {employeeData?.position || roleDisplay}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {employeeData?.department || 'No Department'} • {employeeData?.email || authUser?.email || authUser?.username}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Personal Information
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Employee ID</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{employeeData?.employeeId || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Email</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{employeeData?.email || authUser?.email || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Phone</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{employeeData?.phone || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Address</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{employeeData?.address || 'N/A'}</Typography>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Work /> Work Information
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Department</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{employeeData?.department || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Position</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{employeeData?.position || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Hire Date</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {employeeData?.hireDate ? new Date(employeeData.hireDate).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Status</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{employeeData?.status || 'Active'}</Typography>
            </Box>
          </Card>
        </Box>
      </Card>
    </Container>
  );
};

export default Profile;
