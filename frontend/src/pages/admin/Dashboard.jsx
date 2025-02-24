import React from 'react';
import { Container, Grid, Box } from '@mui/material';
import { Navbar, Nav } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <>

      {/* Main Content */}
      <Container>
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              {/* Sidebar Placeholder */}
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>Sidebar</Box>
            </Grid>

            <Grid item xs={12} md={9}>
              {/* Main Content Placeholder */}
              <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>Main Content</Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;
