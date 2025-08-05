import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeRow = ({ employee, onEdit, onDelete, onView }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
    <TableRow hover>
      <TableCell>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {employee.firstName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={500}>
              {employee.firstName} {employee.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employee.employeeId}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>{employee.email}</TableCell>
      <TableCell>{employee.department}</TableCell>
      <TableCell>{employee.position}</TableCell>
      <TableCell>
        <Chip
          label={employee.status}
          color={getStatusColor(employee.status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        {new Date(employee.hireDate).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              navigate(`/employees/${employee._id}`);
              handleMenuClose();
            }}
          >
            <ViewIcon sx={{ mr: 1 }} fontSize="small" />
            View
          </MenuItem>
          <MenuItem
            onClick={() => {
              onEdit(employee);
              handleMenuClose();
            }}
          >
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDelete(employee);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

const AddEmployeeDialog = ({ open, onClose, employee = null }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: employee || {},
  });

  const mutation = useMutation(
    (data) => {
      if (employee) {
        return axios.put(`/employees/${employee._id}`, data);
      } else {
        return axios.post('/employees', data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success(employee ? 'Employee updated successfully!' : 'Employee added successfully!');
        onClose();
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Operation failed');
      },
    }
  );

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {employee ? 'Edit Employee' : 'Add New Employee'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                {...register('employeeId', { required: 'Employee ID is required' })}
                error={!!errors.employeeId}
                helperText={errors.employeeId?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                {...register('firstName', { required: 'First name is required' })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                {...register('lastName', { required: 'Last name is required' })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                {...register('department', { required: 'Department is required' })}
                error={!!errors.department}
                helperText={errors.department?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                {...register('position', { required: 'Position is required' })}
                error={!!errors.position}
                helperText={errors.position?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                {...register('phone')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                type="number"
                {...register('salary')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills (comma separated)"
                {...register('skills')}
                helperText="Enter skills separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Saving...' : employee ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Employees = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['employees', page, search, department, status],
    async () => {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        department,
        status,
      });
      const response = await axios.get(`/employees?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  const deleteMutation = useMutation(
    (employeeId) => axios.delete(`/employees/${employeeId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Delete failed');
      },
    }
  );

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      deleteMutation.mutate(employee._id);
    }
  };

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Employees
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team members and their information.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)',
            },
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={department}
                  label="Department"
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hire Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.employees?.length > 0 ? (
                data.employees.map((employee) => (
                  <EmployeeRow
                    key={employee._id}
                    employee={employee}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {data && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={data.totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      <AddEmployeeDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        employee={selectedEmployee}
      />
    </Box>
  );
};

export default Employees;