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
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';
import { formatAmount, convertToUSD } from '../../utils/currency';

const incomeCategories = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Rental',
  'Bonus',
  'Dividend',
  'Other',
];

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringFrequency: 'monthly',
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await api.get('/income');
      setIncomes(response.data);
    } catch (error) {
      toast.error('Failed to fetch income');
    }
  };

  const handleOpen = (income = null) => {
    if (income) {
      setEditingIncome(income);
      setFormData({
        amount: income.amount,
        category: income.category,
        source: income.source,
        description: income.description || '',
        date: new Date(income.date).toISOString().split('T')[0],
        isRecurring: income.isRecurring || false,
        recurringFrequency: income.recurringFrequency || 'monthly',
      });
    } else {
      setEditingIncome(null);
      setFormData({
        amount: '',
        category: 'Salary',
        source: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurringFrequency: 'monthly',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingIncome(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        amount: convertToUSD(parseFloat(formData.amount))
      };
      
      if (editingIncome) {
        await api.put(`/income/${editingIncome._id}`, submitData);
        toast.success('Income updated successfully');
      } else {
        await api.post('/income', submitData);
        toast.success('Income added successfully');
      }
      handleClose();
      fetchIncomes();
    } catch (error) {
      toast.error('Failed to save income');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await api.delete(`/income/${id}`);
        toast.success('Income deleted successfully');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Income Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Income
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Total Income
          </Typography>
          <Typography variant="h3" color="primary">
            {formatAmount(totalIncome)}
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income._id}>
                <TableCell>{format(new Date(income.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{income.source}</TableCell>
                <TableCell>
                  <Chip label={income.category} size="small" color="primary" />
                </TableCell>
                <TableCell>{formatAmount(income.amount)}</TableCell>
                <TableCell>{income.description || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(income)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(income._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingIncome ? 'Edit Income' : 'Add New Income'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              margin="normal"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Source"
              margin="normal"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            />
            <TextField
              select
              fullWidth
              label="Category"
              margin="normal"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {incomeCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Date"
              type="date"
              margin="normal"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingIncome ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
