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
  Grid,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HomeIcon from '@mui/icons-material/Home';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatAmount, convertToUSD } from '../../utils/currency';

const debtTypes = ['Credit Card', 'Personal Loan', 'Student Loan', 'Mortgage', 'Auto Loan', 'Other'];

const getDebtIcon = (type) => {
  switch (type) {
    case 'Credit Card':
      return <CreditCardIcon />;
    case 'Mortgage':
      return <HomeIcon />;
    case 'Personal Loan':
    case 'Student Loan':
    case 'Auto Loan':
      return <AccountBalanceIcon />;
    default:
      return <AttachMoneyIcon />;
  }
};

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Credit Card',
    totalAmount: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const response = await api.get('/debts');
      setDebts(response.data);
    } catch (error) {
      toast.error('Failed to fetch debts');
    }
  };

  const handleOpen = (debt = null) => {
    if (debt) {
      setEditingDebt(debt);
      setFormData({
        name: debt.name,
        type: debt.type,
        totalAmount: debt.totalAmount,
        currentBalance: debt.currentBalance,
        interestRate: debt.interestRate || '',
        minimumPayment: debt.minimumPayment || '',
        dueDate: debt.dueDate || '',
        notes: debt.notes || '',
      });
    } else {
      setEditingDebt(null);
      setFormData({
        name: '',
        type: 'Credit Card',
        totalAmount: '',
        currentBalance: '',
        interestRate: '',
        minimumPayment: '',
        dueDate: '',
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDebt(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        totalAmount: convertToUSD(parseFloat(formData.totalAmount)),
        currentBalance: convertToUSD(parseFloat(formData.currentBalance)),
        interestRate: parseFloat(formData.interestRate) || 0,
        minimumPayment: convertToUSD(parseFloat(formData.minimumPayment) || 0),
      };

      if (editingDebt) {
        await api.put(`/debts/${editingDebt._id}`, submitData);
        toast.success('Debt updated successfully');
      } else {
        await api.post('/debts', submitData);
        toast.success('Debt added successfully');
      }
      handleClose();
      fetchDebts();
    } catch (error) {
      toast.error('Failed to save debt');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      try {
        await api.delete(`/debts/${id}`);
        toast.success('Debt deleted successfully');
        fetchDebts();
      } catch (error) {
        toast.error('Failed to delete debt');
      }
    }
  };

  const handleMakePayment = async (debt) => {
    const amount = window.prompt(`Enter payment amount for ${debt.name}:`);
    if (amount && !isNaN(amount) && amount > 0) {
      try {
        const paymentAmount = convertToUSD(parseFloat(amount));
        const newBalance = parseFloat(debt.currentBalance) - paymentAmount;
        
        if (newBalance < 0) {
          toast.error('Payment amount cannot exceed current balance');
          return;
        }
        
        // Create payment record
        await api.post('/debt-payments', {
          debtId: debt._id,
          amount: paymentAmount,
          description: `Payment for ${debt.name}`
        });
        
        toast.success(`Payment of ${formatAmount(amount)} recorded for ${debt.name}`);
        fetchDebts();
      } catch (error) {
        toast.error('Failed to record payment');
      }
    }
  };

  const getPayoffProgress = (debt) => {
    if (!debt.totalAmount || debt.totalAmount === 0) return 0;
    const paidOff = debt.totalAmount - debt.currentBalance;
    return (paidOff / debt.totalAmount) * 100;
  };

  const getEstimatedPayoffMonths = (debt) => {
    if (!debt.minimumPayment || debt.minimumPayment === 0) return null;
    const monthlyRate = debt.interestRate / 100 / 12;
    const balance = debt.currentBalance;
    
    if (monthlyRate === 0) {
      return Math.ceil(balance / debt.minimumPayment);
    }
    
    if (debt.minimumPayment <= balance * monthlyRate) {
      return null; // Will never pay off
    }
    
    const months = -Math.log(1 - (balance * monthlyRate) / debt.minimumPayment) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + (debt.minimumPayment || 0), 0);
  const totalInterestRate = debts.length > 0
    ? debts.reduce((sum, debt) => sum + (debt.interestRate || 0), 0) / debts.length
    : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Debts Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Debt
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Debt
                </Typography>
              </Box>
              <Typography variant="h4" color="error">
                {formatAmount(totalDebt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Monthly Minimum Payments
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatAmount(totalMinimumPayments)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Average Interest Rate
              </Typography>
              <Typography variant="h4" color="primary">
                {totalInterestRate.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Debt Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Current Balance</TableCell>
              <TableCell>Interest Rate</TableCell>
              <TableCell>Min. Payment</TableCell>
              <TableCell>Payoff Progress</TableCell>
              <TableCell>Est. Payoff</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    No debts recorded yet. Click "Add Debt" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt) => {
                const payoffProgress = getPayoffProgress(debt);
                const payoffMonths = getEstimatedPayoffMonths(debt);

                return (
                  <TableRow key={debt._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: 'primary.main' }}>
                          {getDebtIcon(debt.type)}
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {debt.name}
                          </Typography>
                          {debt.notes && (
                            <Typography variant="caption" color="textSecondary">
                              {debt.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={debt.type} size="small" color="secondary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {formatAmount(debt.currentBalance)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        of {formatAmount(debt.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {debt.interestRate ? `${debt.interestRate.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {debt.minimumPayment ? formatAmount(debt.minimumPayment) : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <LinearProgress
                        variant="determinate"
                        value={payoffProgress}
                        color={payoffProgress >= 100 ? 'success' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {payoffProgress.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {payoffMonths ? (
                        <Typography variant="body2" color="textSecondary">
                          {payoffMonths < 12
                            ? `${payoffMonths} months`
                            : `${Math.floor(payoffMonths / 12)} years`}
                        </Typography>
                      ) : (
                        <Chip label="Never" size="small" color="error" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleMakePayment(debt)}
                        color="success"
                        title="Make payment"
                      >
                        <AttachMoneyIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(debt)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(debt._id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingDebt ? 'Edit Debt' : 'Add New Debt'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Debt Name"
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Chase Credit Card"
            />
            <TextField
              select
              fullWidth
              label="Debt Type"
              margin="normal"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              {debtTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Original Amount"
                  type="number"
                  margin="normal"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  required
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Current Balance"
                  type="number"
                  margin="normal"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                  required
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  margin="normal"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  helperText="Annual percentage rate"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Minimum Payment"
                  type="number"
                  margin="normal"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Due Date (Day)"
                  type="number"
                  margin="normal"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  InputProps={{ inputProps: { min: 1, max: 31 } }}
                  helperText="Day of month"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Notes"
              margin="normal"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this debt"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingDebt ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
