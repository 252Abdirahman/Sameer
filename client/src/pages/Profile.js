import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const InfoItem = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" mb={2}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 1,
        bgcolor: 'primary.light',
        color: 'primary.contrastText',
        mr: 2,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || 'Not provided'}
      </Typography>
    </Box>
  </Box>
);

const Profile = () => {
  const { user } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'hr':
        return 'warning';
      case 'manager':
        return 'info';
      case 'employee':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'hr':
        return '👥';
      case 'manager':
        return '👨‍💼';
      case 'employee':
        return '👤';
      default:
        return '👤';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box>
        <Box mb={3}>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your account information
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {user?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    {getRoleIcon(user?.role)}
                  </Typography>
                  <Chip
                    label={user?.role?.toUpperCase()}
                    color={getRoleColor(user?.role)}
                    variant="filled"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Account Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<AccountIcon fontSize="small" />}
                      label="Username"
                      value={user?.username}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<EmailIcon fontSize="small" />}
                      label="Email"
                      value={user?.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<AdminIcon fontSize="small" />}
                      label="Role"
                      value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<TimeIcon fontSize="small" />}
                      label="Last Login"
                      value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Employee Information */}
          {user?.employee && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Employee Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoItem
                        icon={<AccountIcon fontSize="small" />}
                        label="Full Name"
                        value={`${user.employee.firstName} ${user.employee.lastName}`}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoItem
                        icon={<AdminIcon fontSize="small" />}
                        label="Employee ID"
                        value={user.employee.employeeId}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoItem
                        icon={<AdminIcon fontSize="small" />}
                        label="Department"
                        value={user.employee.department}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoItem
                        icon={<AdminIcon fontSize="small" />}
                        label="Position"
                        value={user.employee.position}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* System Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  System Access
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box>
                  <Typography variant="body1" gutterBottom>
                    <strong>Permissions:</strong>
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {user?.role === 'admin' && (
                      <>
                        <Chip label="Full System Access" color="error" variant="outlined" />
                        <Chip label="User Management" color="error" variant="outlined" />
                        <Chip label="Employee Management" color="error" variant="outlined" />
                        <Chip label="AI Chat Access" color="error" variant="outlined" />
                      </>
                    )}
                    {user?.role === 'hr' && (
                      <>
                        <Chip label="Employee Management" color="warning" variant="outlined" />
                        <Chip label="AI Chat Access" color="warning" variant="outlined" />
                        <Chip label="Reports Access" color="warning" variant="outlined" />
                      </>
                    )}
                    {user?.role === 'manager' && (
                      <>
                        <Chip label="Team Management" color="info" variant="outlined" />
                        <Chip label="AI Chat Access" color="info" variant="outlined" />
                        <Chip label="Employee View" color="info" variant="outlined" />
                      </>
                    )}
                    {user?.role === 'employee' && (
                      <>
                        <Chip label="Profile Access" color="success" variant="outlined" />
                        <Chip label="AI Chat Access" color="success" variant="outlined" />
                        <Chip label="Dashboard View" color="success" variant="outlined" />
                      </>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    🔒 Your account has {user?.role} level access to the Protocol Employees System.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default Profile;