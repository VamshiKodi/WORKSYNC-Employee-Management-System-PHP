import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.svg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { role } = await login(formData.username, formData.password);
      
      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          className="login-container"
          sx={{
            animation: 'slideIn 0.8s ease-out',
          }}
        >
          <Paper
            elevation={0}
            className="login-form-container"
            sx={{
              padding: { xs: 4, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(236, 240, 241, 0.8)',
              boxShadow: '0 25px 50px rgba(44, 62, 80, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2c3e50, #e74c3c, #34495e)',
              },
            }}
          >
            {/* Logo/Brand */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <img src={logo} alt="WORKSYNC Logo" style={{ width: 64, height: 64, marginBottom: 8, filter: 'drop-shadow(0 4px 16px #6366f1aa)' }} />
              <Typography variant="h4" sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #e74c3c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 8px #6366f155',
                mb: 1,
                animation: 'fadeInUp 0.7s',
              }}>
                WORKSYNC
              </Typography>
            </Box>

            <Typography 
              variant="h3" 
              className="welcome-title"
              sx={{ 
                mb: 1, 
                color: '#2c3e50', 
                fontWeight: 700,
                textAlign: 'center',
                fontFamily: '"Playfair Display", serif',
                letterSpacing: '-0.02em',
                animation: 'fadeInUp 0.6s ease-out 0.2s both',
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography 
              variant="body1" 
              className="welcome-subtitle"
              sx={{ 
                mb: 4, 
                color: '#7f8c8d',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '0.5px',
                animation: 'fadeInUp 0.6s ease-out 0.4s both',
              }}
            >
              Sign in to your Employee Management System
            </Typography>

            {error && (
              <Box
                className="error-container"
                sx={{
                  width: '100%',
                  mb: 3,
                  animation: 'shake 0.5s ease-in-out',
                }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#e74c3c',
                    },
                  }}
                >
                  {error}
                </Alert>
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Box
                className="input-container"
                sx={{
                  animation: 'fadeInUp 0.6s ease-out 0.6s both',
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={formData.username}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#7f8c8d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          👤
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
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
                      '&.Mui-focused': {
                        transform: 'scale(1.02)',
                      },
                    },
                  }}
                />
              </Box>

              <Box
                className="input-container"
                sx={{
                  animation: 'fadeInUp 0.6s ease-out 0.8s both',
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#7f8c8d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          🔒
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#7f8c8d' }}
                        >
                          {showPassword ? '👁️‍🗨️' : '👁️'}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 4,
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
                      '&.Mui-focused': {
                        transform: 'scale(1.02)',
                      },
                    },
                  }}
                />
              </Box>

              <Box
                className="button-container"
                sx={{
                  animation: 'fadeInUp 0.6s ease-out 1s both',
                }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  className="elegant-button"
                  sx={{
                    py: 2,
                    px: 4,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    letterSpacing: '0.5px',
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(44, 62, 80, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(44, 62, 80, 0.4)',
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                    },
                    '&:disabled': {
                      background: '#bdc3c7',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage; 