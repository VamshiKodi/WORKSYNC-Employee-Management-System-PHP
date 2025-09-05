// Import types (must come first for ESLint import/first)
import { Activity, ActivityFilters } from '../types/activity';

// Define API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// API headers with authentication
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Get all activities with optional filters
 */
export const getAllActivities = async (params?: ActivityFilters) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.type) queryParams.append('type', params.type);

  const response = await fetch(
    `${API_BASE_URL}/activities?${queryParams.toString()}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch activities');
  }

  return response.json();
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (params?: { 
  startDate?: string; 
  endDate?: string;
  type?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.type) queryParams.append('type', params.type);

  const response = await fetch(
    `${API_BASE_URL}/activities/stats?${queryParams.toString()}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch activity statistics');
  }

  return response.json();
};

/**
 * Get activity by ID
 */
export const getActivityById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch activity');
  }

  return response.json();
};

/**
 * Create a new activity
 */
export const createActivity = async (activityData: Omit<Activity, 'id' | 'timestamp'>) => {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create activity');
  }

  return response.json();
};

/**
 * Update an activity
 */
export const updateActivity = async (id: string, activityData: Partial<Activity>) => {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update activity');
  }

  return response.json();
};

/**
 * Delete an activity
 */
export const deleteActivity = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete activity');
  }

  return response.json();
};

// For backward compatibility
export const activityAPI = {
  getAll: getAllActivities,
  getStats: getActivityStats,
  create: createActivity,
  getById: getActivityById,
  update: updateActivity,
  delete: deleteActivity,
};

export default {
  getAllActivities,
  getActivityStats,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  activityAPI,
};
