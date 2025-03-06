import React from 'react';
import { Container, Grid, Box, Typography, Paper, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';

const data = [
  { name: 'Active Users', value: 450 },
  { name: 'Inactive Users', value: 150 },
  { name: 'New Signups', value: 200 },
];

const COLORS = ['#3f51b5', '#9c27b0', '#009688'];

const barChartData = [
  { name: 'Jan', users: 300 },
  { name: 'Feb', users: 400 },
  { name: 'Mar', users: 350 },
  { name: 'Apr', users: 500 },
  { name: 'May', users: 450 },
  { name: 'Jun', users: 600 },
];

const lineChartData = [
  { name: 'Week 1', users: 150 },
  { name: 'Week 2', users: 250 },
  { name: 'Week 3', users: 200 },
  { name: 'Week 4', users: 300 },
];

const Dashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, paddingTop: '64px' }}> {/* Added paddingTop */}
      <Grid container spacing={3}>
        {/* User Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" component="div">
                <CountUp end={800} duration={2.5} separator="," />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" component="div">
                <CountUp end={450} duration={2.5} separator="," />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                New Signups
              </Typography>
              <Typography variant="h4" component="div">
                <CountUp end={200} duration={2.5} separator="," />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Inactive Users
              </Typography>
              <Typography variant="h4" component="div">
                <CountUp end={150} duration={2.5} separator="," />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom>User Distribution</Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <PieChart width={400} height={300}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom>Another Distribution</Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <PieChart width={400} height={300}>
                <Pie
                  data={[
                    { name: 'Mobile', value: 500 },
                    { name: 'Desktop', value: 300 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Mobile', color: '#ff9800' },
                    { name: 'Desktop', color: '#673ab7' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Box>
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom>Monthly User Growth</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom>Weekly User Activity</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;