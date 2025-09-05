import { ReactNode } from 'react';

export interface ActivityUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
}

export interface Activity {
  _id: string;
  type: 'login' | 'logout' | 'task' | 'system' | 'update' | 'other';
  user: string | ActivityUser;
  action: string;
  details: string;
  timestamp: string | Date;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
  read?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ActivityResponse {
  data: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityStats {
  total: number;
  today: number;
  byType: Record<string, number>;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byUser: Array<{
    user: string | ActivityUser;
    count: number;
  }>;
}

export interface ActivityFilters {
  search?: string;
  type?: string;
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  userId?: string;
  read?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityFormData {
  type: string;
  action: string;
  details: string;
  priority: 'low' | 'medium' | 'high';
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ActivityType {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
}
