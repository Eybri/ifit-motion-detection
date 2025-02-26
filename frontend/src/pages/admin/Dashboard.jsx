import React from 'react';
import { Container, Grid, Box, Typography, Paper } from '@mui/material';
import { Navbar, Nav } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 },
  { name: 'Category C', value: 300 },
  { name: 'Category D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  return (
    <>
     
Q
      {/* Main Content */}
      <Container>
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              {/* Sidebar */}
              <Paper sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6">Sidebar</Typography>
                <Nav className="flex-column">
                  <Nav.Link href="#">Dashboard</Nav.Link>
                  <Nav.Link href="#">Users</Nav.Link>
                  <Nav.Link href="#">Reports</Nav.Link>
                </Nav>
              </Paper>
            </Grid>

            <Grid item xs={12} md={9}>
              {/* Main Content */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>Analytics Overview</Typography>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <PieChart width={400} height={300}>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;