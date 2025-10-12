// PHP Backend API Configuration (using proxy in package.json)
const API_BASE_URL = '/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  console.log('API Response status:', response.status, 'content-type:', contentType);
  
  if (!response.ok) {
    try {
      // Clone the response to avoid consuming it
      const responseClone = response.clone();
      const text = await responseClone.text();
      console.log('Error response text:', text);
      
      if (text && text.trim() && contentType.includes('application/json')) {
        try {
          const errBody = JSON.parse(text);
          console.log('JSON error response:', errBody);
          // backend may return { error: '...' } or { message: '...' }
          const msg = errBody.error || errBody.message || `HTTP ${response.status}`;
          throw new Error(msg);
        } catch (parseError) {
          console.log('Failed to parse JSON error response:', parseError);
          throw new Error(text || `HTTP ${response.status}`);
        }
      } else {
        console.log('Non-JSON error response:', text);
        throw new Error(text || `HTTP ${response.status}`);
      }
    } catch (e: any) {
      console.log('Error parsing response:', e);
      // Fallback
      throw new Error(e?.message || `HTTP ${response.status}`);
    }
  }
  
  try {
    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('JSON response:', jsonData);
      return jsonData;
    } else {
      // If backend sends no content/other type, return empty
      console.log('Non-JSON response, returning null');
      return null as any;
    }
  } catch (e: any) {
    console.log('Error parsing success response:', e);
    throw new Error('Invalid response format');
  }
};

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Getting auth token:', token ? 'Token found' : 'No token');
  return token;
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

// Authentication API (PHP Backend)
export const authAPI = {
  // Login user
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include', // This is important for sending/receiving cookies
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

// System Status API
export const systemAPI = {
  // Get API information
  getAPIInfo: async () => {
    const response = await fetch(`${API_BASE_URL}`);
    return handleResponse(response);
  },

  // Health check
  getHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },

  // Test database connection
  testDatabase: async () => {
    const response = await fetch(`${API_BASE_URL}/test-users`);
    return handleResponse(response);
  },
};

// Departments API
export const departmentsAPI = {
  getOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/departments/overview`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Employees API (PHP Backend)
export const employeesAPI = {
  // Get all employees
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
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

  // Delete employee
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Update employee credentials (admin only)
  updateCredentials: async (id: string, payload: { username?: string; password?: string }) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/credentials`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  // Get employee statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/employees/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Leaves API
export const leavesAPI = {
  // Get all leave requests (admin/hr see all, employees see their own)
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/leave-requests`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new leave request
  create: async (payload: { leaveType: string; startDate: string; endDate: string; reason: string }) => {
    const response = await fetch(`${API_BASE_URL}/leave-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  // Approve leave request (admin/hr only)
  approve: async (id: number, comments?: string) => {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ comments }),
    });
    return handleResponse(response);
  },

  // Reject leave request (admin/hr only)
  reject: async (id: number, comments?: string) => {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${id}/reject`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ comments }),
    });
    return handleResponse(response);
  },

  // Delete leave request
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Legacy methods for compatibility
  getMy: async (params?: { status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    return {
      items: [
        {
          _id: '1',
          type: 'annual',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          status: 'approved',
          reason: 'Vacation'
        }
      ],
      total: 1
    };
  },

  // Admin/HR: list leaves
  list: async (params?: { status?: string; employeeId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    // Mock implementation - replace with actual API call
    return {
      items: [
        {
          _id: '1',
          employeeId: { firstName: 'John', lastName: 'Doe' },
          type: 'annual',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          status: 'approved'
        }
      ],
      total: 1
    };
  },

  // Get leave by ID
  getById: async (id: string) => {
    // Mock implementation - replace with actual API call
    return {
      _id: id,
      type: 'annual',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      status: 'approved'
    };
  },

  // Update leave
  update: async (id: string, payload: any) => {
    // Mock implementation - replace with actual API call
    return { _id: id, ...payload };
  },
};


// Register a user for a new employee (admin only)
export const registerEmployeeUser = async ({ username, email, password, role, employeeId }: { username: string; email: string; password: string; role: string; employeeId: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, email, password, role, employeeId }),
  });
  return handleResponse(response);
};

// Attendance API
export const attendanceAPI = {
  // Get attendance records
  getAll: async (params?: { employeeId?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/attendance?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Clock in
  clockIn: async (data?: { location?: string; notes?: string }) => {
    const response = await fetch(`${API_BASE_URL}/attendance/clock-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data || {}),
    });
    return handleResponse(response);
  },

  // Clock out
  clockOut: async (data?: { notes?: string }) => {
    const response = await fetch(`${API_BASE_URL}/attendance/clock-out`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data || {}),
    });
    return handleResponse(response);
  },

  // Get current attendance status
  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/status`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};