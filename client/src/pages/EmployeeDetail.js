import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  IconButton,
  Button,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

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

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    ['employee', id],
    async () => {
      const response = await axios.get(`/employees/${id}`);
      return response.data.employee;
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <LoadingSpinner size={40} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="error" gutterBottom>
          Employee not found
        </Typography>
        <Button onClick={() => navigate('/employees')} variant="outlined">
          Back to Employees
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box>
        <Box mb={3} display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/employees')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Box flexGrow={1}>
            <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
              Employee Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage employee information
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)',
              },
            }}
          >
            Edit Employee
          </Button>
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
                  {data.firstName.charAt(0)}
                </Avatar>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {data.firstName} {data.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {data.position}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {data.department}
                </Typography>
                <Box mt={2}>
                  <Chip
                    label={data.status}
                    color={getStatusColor(data.status)}
                    variant="filled"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<EmailIcon fontSize="small" />}
                      label="Email"
                      value={data.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<PhoneIcon fontSize="small" />}
                      label="Phone"
                      value={data.phone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<BusinessIcon fontSize="small" />}
                      label="Department"
                      value={data.department}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<WorkIcon fontSize="small" />}
                      label="Position"
                      value={data.position}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<CalendarIcon fontSize="small" />}
                      label="Hire Date"
                      value={new Date(data.hireDate).toLocaleDateString()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<BusinessIcon fontSize="small" />}
                      label="Employee ID"
                      value={data.employeeId}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Skills
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {data.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Address */}
          {data.address && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Address
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {data.address.street && `${data.address.street}, `}
                    {data.address.city && `${data.address.city}, `}
                    {data.address.state && `${data.address.state} `}
                    {data.address.zipCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {data.address.country || 'USA'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Notes */}
          {data.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {data.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default EmployeeDetail;