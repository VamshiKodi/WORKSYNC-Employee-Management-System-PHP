const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set auth token in localStorage
const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// API headers with authentication
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(response);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Logout user
  logout: () => {
    removeAuthToken();
  },
};

// Register a user for a new employee (admin only)
export const registerEmployeeUser = async ({ username, email, password, role, employeeId }: { username: string; email: string; password: string; role: string; employeeId: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, email, password, role, employeeId }),
  });
  return handleResponse(response);
};

// Employees API
export const employeesAPI = {
  // Get all employees
  getAll: async (params?: { page?: number; limit?: number; search?: string; department?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/employees?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get single employee
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create new employee
  create: async (employeeData: any) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  // Update employee
  update: async (id: string, employeeData: any) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  // Update credentials (admin only)
  updateCredentials: async (id: string, payload: { username?: string; password?: string }) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/credentials`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  // Delete employee
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get employee statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/employees/stats/overview`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Attendance API
export const attendanceAPI = {
  // Clock in
  clockIn: async (location?: any) => {
    const response = await fetch(`${API_BASE_URL}/attendance/clock-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ location }),
    });
    return handleResponse(response);
  },

  // Clock out
  clockOut: async (location?: any) => {
    const response = await fetch(`${API_BASE_URL}/attendance/clock-out`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ location }),
    });
    return handleResponse(response);
  },

  // Get my attendance records
  getMyAttendance: async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/attendance/my-attendance?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get current attendance status
  getCurrentStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/current-status`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get all attendance records (admin only)
  getAll: async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; employeeId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/attendance/all?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get attendance statistics
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/attendance/stats/overview?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Health check API
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};