import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import People from '@mui/icons-material/People';
import Work from '@mui/icons-material/Work';
import Schedule from '@mui/icons-material/Schedule';
import Assessment from '@mui/icons-material/Assessment';
import Refresh from '@mui/icons-material/Refresh';
import Download from '@mui/icons-material/Download';
import FilterList from '@mui/icons-material/FilterList';
import ModernCorporateColors from '../styles/modern-corporate-colors';

// Mock data for charts
const employeeData = [
  { name: 'Engineering', employees: 45, target: 50, color: '#03045e' },
  { name: 'Marketing', employees: 32, target: 35, color: '#023e8a' },
  { name: 'Sales', employees: 28, target: 30, color: '#0077b6' },
  { name: 'HR', employees: 15, target: 18, color: '#0096c7' },
  { name: 'Finance', employees: 12, target: 15, color: '#00b4d8' },
  { name: 'IT', employees: 20, target: 25, color: '#48cae4' },
];

const attendanceData = [
  { month: 'Jan', present: 95, absent: 5, late: 3 },
  { month: 'Feb', present: 92, absent: 8, late: 4 },
  { month: 'Mar', present: 88, absent: 12, late: 6 },
  { month: 'Apr', present: 94, absent: 6, late: 2 },
  { month: 'May', present: 91, absent: 9, late: 5 },
  { month: 'Jun', present: 96, absent: 4, late: 1 },
];

const performanceData = [
  { name: 'Q1', target: 85, actual: 87 },
  { name: 'Q2', target: 88, actual: 91 },
  { name: 'Q3', target: 90, actual: 89 },
  { name: 'Q4', target: 92, actual: 94 },
];

const leaveData = [
  { name: 'Vacation', value: 35, color: '#03045e' },
  { name: 'Sick Leave', value: 20, color: '#0077b6' },
  { name: 'Personal', value: 15, color: '#00b4d8' },
  { name: 'Other', value: 10, color: '#48cae4' },
];

const topPerformers = [
  { name: 'John Doe', department: 'Engineering', performance: 95, avatar: 'JD' },
  { name: 'Jane Smith', department: 'Marketing', performance: 92, avatar: 'JS' },
  { name: 'Mike Johnson', department: 'Sales', performance: 89, avatar: 'MJ' },
  { name: 'Sarah Wilson', department: 'HR', performance: 87, avatar: 'SW' },
  { name: 'David Brown', department: 'Finance', performance: 85, avatar: 'DB' },
];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');

  const metrics = [
    {
      title: 'Total Employees',
      value: '152',
      change: '+12%',
      trend: 'up',
      icon: <People />,
      color: ModernCorporateColors.blueGradient1,
    },
    {
      title: 'Active Projects',
      value: '24',
      change: '+8%',
      trend: 'up',
      icon: <Work />,
      color: ModernCorporateColors.blueGradient3,
    },
    {
      title: 'Attendance Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: <Schedule />,
      color: ModernCorporateColors.blueGradient5,
    },
    {
      title: 'Avg. Performance',
      value: '87.5%',
      change: '+1.8%',
      trend: 'up',
      icon: <Assessment />,
      color: ModernCorporateColors.blueGradient7,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 180, 216, 0.2)',
            boxShadow: '0 8px 32px rgba(3, 4, 94, 0.1)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ minHeight: '100vh', background: ModernCorporateColors.lightGray, p: 3 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 1,
                }}
              >
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: ModernCorporateColors.slateGrayLight }}>
                Comprehensive insights and performance metrics
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  aria-label="Refresh Data"
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Report">
                <IconButton 
                  aria-label="Export Report"
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                  }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter Options">
                <IconButton 
                  aria-label="Filter Options"
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                  }}
                >
                  <FilterList />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Time Range Selector */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <Chip
                key={range}
                label={range.charAt(0).toUpperCase() + range.slice(1)}
                onClick={() => setTimeRange(range)}
                sx={{
                  background: timeRange === range 
                    ? 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)'
                    : 'rgba(255, 255, 255, 0.8)',
                  color: timeRange === range ? 'white' : ModernCorporateColors.slateGray,
                  fontWeight: 600,
                  '&:hover': {
                    background: timeRange === range 
                      ? 'linear-gradient(135deg, #0077b6 0%, #03045e 100%)'
                      : 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Metrics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          {metrics.map((metric, index) => (
            <Card
              key={index}
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 180, 216, 0.2)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(3, 4, 94, 0.15)',
                  borderColor: 'rgba(0, 180, 216, 0.4)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${metric.color} 0%, ${ModernCorporateColors.blueGradient5} 100%)`,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {metric.trend === 'up' ? (
                      <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                    ) : (
                      <TrendingDown sx={{ color: '#ef4444', fontSize: 20 }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: metric.trend === 'up' ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {metric.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: ModernCorporateColors.blueGradient1, mb: 1 }}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" sx={{ color: ModernCorporateColors.slateGrayLight, fontWeight: 500 }}>
                  {metric.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts Section */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          {/* Employee Distribution */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 180, 216, 0.2)',
              borderRadius: 3,
              height: 400,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                Employee Distribution by Department
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={ModernCorporateColors.lightGrayDark} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: ModernCorporateColors.slateGray }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: ModernCorporateColors.slateGray }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="employees" fill={ModernCorporateColors.blueGradient5} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance Trend */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 180, 216, 0.2)',
              borderRadius: 3,
              height: 400,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                Attendance Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={ModernCorporateColors.lightGrayDark} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: ModernCorporateColors.slateGray }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: ModernCorporateColors.slateGray }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="present" 
                    stackId="1"
                    stroke={ModernCorporateColors.blueGradient1}
                    fill={ModernCorporateColors.blueGradient1}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="absent" 
                    stackId="1"
                    stroke={ModernCorporateColors.error}
                    fill={ModernCorporateColors.error}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance vs Target */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 180, 216, 0.2)',
              borderRadius: 3,
              height: 400,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                Performance vs Target
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={ModernCorporateColors.lightGrayDark} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: ModernCorporateColors.slateGray }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: ModernCorporateColors.slateGray }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke={ModernCorporateColors.blueGradient1}
                    strokeWidth={3}
                    dot={{ fill: ModernCorporateColors.blueGradient1, strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke={ModernCorporateColors.blueGradient5}
                    strokeWidth={3}
                    dot={{ fill: ModernCorporateColors.blueGradient5, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leave Distribution */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 180, 216, 0.2)',
              borderRadius: 3,
              height: 400,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
                Leave Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Top Performers Table */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 240, 248, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 180, 216, 0.2)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: ModernCorporateColors.blueGradient1, mb: 3 }}>
              Top Performers
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Performance</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPerformers.map((performer, index) => (
                    <TableRow key={index} sx={{ '&:hover': { background: 'rgba(0, 180, 216, 0.05)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              background: `linear-gradient(135deg, ${ModernCorporateColors.blueGradient5} 0%, ${ModernCorporateColors.blueGradient7} 100%)`,
                              width: 40,
                              height: 40,
                              fontSize: '0.9rem',
                              fontWeight: 600,
                            }}
                          >
                            {performer.avatar}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {performer.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={performer.department}
                          size="small"
                          sx={{
                            background: 'rgba(0, 180, 216, 0.1)',
                            color: ModernCorporateColors.blueGradient1,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={performer.performance}
                            sx={{
                              width: 60,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(0, 180, 216, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${ModernCorporateColors.blueGradient1} 0%, ${ModernCorporateColors.blueGradient5} 100%)`,
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ModernCorporateColors.blueGradient1 }}>
                            {performer.performance}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Excellent"
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Analytics; 