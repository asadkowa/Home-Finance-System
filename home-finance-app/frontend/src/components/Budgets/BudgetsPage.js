import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  Grid,
  useTheme,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatAmount, convertToUSD } from '../../utils/currency';

const budgetCategories = [
  'Housing',
  'Utilities',
  'Food',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Education',
  'Shopping',
  'Savings & Investments',
  'Debt Payments',
  'Insurance',
  'Personal Care',
  'Gifts & Donations',
  'Miscellaneous',
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    period: 'monthly',
    notificationThreshold: 80,
  });
  const theme = useTheme();

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets');
      setBudgets(response.data.filter(b => b.isActive));
    } catch (error) {
      toast.error('Failed to fetch budgets');
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    }
  };

  const handleOpen = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        notificationThreshold: budget.notificationThreshold || 80,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category: 'Food',
        amount: '',
        period: 'monthly',
        notificationThreshold: 80,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        amount: convertToUSD(parseFloat(formData.amount))
      };
      
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, submitData);
        toast.success('Budget updated successfully');
      } else {
        await api.post('/budgets', submitData);
        toast.success('Budget created successfully');
      }
      handleClose();
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.put(`/budgets/${id}`, { isActive: false });
        toast.success('Budget deleted successfully');
        fetchBudgets();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const getSpentAmount = (budget) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return expenses
      .filter(exp => 
        exp.category === budget.category &&
        new Date(exp.date) >= startOfMonth
      )
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getProgress = (budget) => {
    const spent = getSpentAmount(budget);
    return Math.min((spent / budget.amount) * 100, 100);
  };

  const getBudgetStatus = (budget) => {
    const progress = getProgress(budget);
    if (progress >= 100) return { color: 'error', text: 'Exceeded' };
    if (progress >= 90) return { color: 'warning', text: 'Critical' };
    if (progress >= budget.notificationThreshold) return { color: 'warning', text: 'Warning' };
    return { color: 'success', text: 'On Track' };
  };

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + getSpentAmount(budget), 0);
  const remainingBudget = totalBudgeted - totalSpent;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Budget Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Create Budget
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4" color="primary">
                {formatAmount(totalBudgeted)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4" color="error">
                {formatAmount(totalSpent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Remaining
              </Typography>
              <Typography 
                variant="h4" 
                color={remainingBudget >= 0 ? 'success.main' : 'error.main'}
              >
                {formatAmount(remainingBudget)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Budget Amount</TableCell>
              <TableCell>Spent</TableCell>
              <TableCell>Remaining</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    No budgets created yet. Click "Create Budget" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              budgets.map((budget) => {
                const spent = getSpentAmount(budget);
                const remaining = budget.amount - spent;
                const progress = getProgress(budget);
                const status = getBudgetStatus(budget);

                return (
                  <TableRow key={budget._id}>
                    <TableCell>
                      <Chip label={budget.category} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{formatAmount(budget.amount)}</TableCell>
                    <TableCell>{formatAmount(spent)}</TableCell>
                    <TableCell>
                      <Typography
                        color={remaining >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatAmount(remaining)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={status.color}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {progress.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.text}
                        size="small"
                        color={status.color}
                        icon={status.color === 'error' ? <WarningIcon /> : null}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(budget)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(budget._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Category"
              margin="normal"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {budgetCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Budget Amount"
              type="number"
              margin="normal"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
            <TextField
              select
              fullWidth
              label="Period"
              margin="normal"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              required
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="bi-weekly">Bi-Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Warning Threshold (%)"
              type="number"
              margin="normal"
              value={formData.notificationThreshold}
              onChange={(e) => setFormData({ ...formData, notificationThreshold: e.target.value })}
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              helperText="Get notified when budget usage reaches this percentage"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingBudget ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
