import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const StatCard = ({ title, value, icon, color, change, loading = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" fontWeight={600}>
              {loading ? '...' : value}
            </Typography>
            {change && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon
                  fontSize="small"
                  sx={{
                    color: change > 0 ? 'success.main' : 'error.main',
                    mr: 0.5,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: change > 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {change > 0 ? '+' : ''}{change}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery(
    'employeeStats',
    async () => {
      const response = await axios.get('/employees/stats/overview');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Mock data for charts
  const monthlyHires = [
    { month: 'Jan', hires: 12 },
    { month: 'Feb', hires: 19 },
    { month: 'Mar', hires: 8 },
    { month: 'Apr', hires: 15 },
    { month: 'May', hires: 22 },
    { month: 'Jun', hires: 18 },
  ];

  const departmentColors = [
    '#2563eb',
    '#7c3aed',
    '#059669',
    '#dc2626',
    '#d97706',
    '#4f46e5',
  ];

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Protocol Employees System. Here's your overview.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={<PeopleIcon />}
            color="primary.main"
            change={12}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Departments"
            value={stats?.departmentStats?.length || 0}
            icon={<BusinessIcon />}
            color="secondary.main"
            change={5}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Hires This Month"
            value={22}
            icon={<TrendingUpIcon />}
            color="success.main"
            change={18}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI Chat Sessions"
            value={156}
            icon={<ChatIcon />}
            color="warning.main"
            change={-3}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Monthly Hiring Trends
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyHires}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="hires"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Departments
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.departmentStats || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ _id, count }) => `${_id}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(stats?.departmentStats || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={departmentColors[index % departmentColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Hires */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Recent Hires
                </Typography>
                {isLoading ? (
                  <LinearProgress />
                ) : (
                  <Box>
                    {stats?.recentHires?.map((employee, index) => (
                      <Box
                        key={employee._id}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        py={1}
                        borderBottom={
                          index < stats.recentHires.length - 1 ? 1 : 0
                        }
                        borderColor="divider"
                      >
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              mr: 2,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {employee.firstName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {employee.position}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(employee.hireDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box
                    p={2}
                    border={1}
                    borderColor="divider"
                    borderRadius={2}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      Add New Employee
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quickly add a new team member
                    </Typography>
                  </Box>
                  <Box
                    p={2}
                    border={1}
                    borderColor="divider"
                    borderRadius={2}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      Generate Reports
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create employee reports and analytics
                    </Typography>
                  </Box>
                  <Box
                    p={2}
                    border={1}
                    borderColor="divider"
                    borderRadius={2}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      AI Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get help with HR tasks and questions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;