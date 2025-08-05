import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = ({ size = 24, color = 'primary' }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default LoadingSpinner;