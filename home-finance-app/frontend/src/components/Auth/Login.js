import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Box, TextField, Button, Typography, Paper, useTheme } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 5, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AccountBalanceIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to continue to Home Finance System
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Typography align="center" sx={{ mt: 2 }}>
              Don't have an account? <Link to="/register" style={{ color: theme.palette.primary.main }}>Register</Link>
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/landing" style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                Back to Home
              </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
