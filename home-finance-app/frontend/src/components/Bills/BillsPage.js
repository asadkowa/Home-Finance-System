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
  Switch,
  FormControlLabel,
  Alert,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaidIcon from '@mui/icons-material/Paid';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format, parseISO, differenceInDays, isPast, isToday } from 'date-fns';
import { formatAmount, convertToUSD } from '../../utils/currency';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const billCategories = [
  'Utilities',
  'Internet',
  'Phone',
  'Insurance',
  'Rent/Mortgage',
  'Credit Card',
  'Loan Payment',
  'Subscription',
  'Healthcare',
  'Other',
];

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Utilities',
    amount: '',
    dueDate: null,
    isAutoPaid: false,
    isPaid: false,
    notes: '',
    reminderDays: 3,
    isRecurring: false,
    recurrenceType: 'monthly',
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/bills');
      setBills(response.data);
    } catch (error) {
      toast.error('Failed to fetch bills');
    }
  };

  const handleOpen = (bill = null) => {
    if (bill) {
      setEditingBill(bill);
      setFormData({
        name: bill.name,
        category: bill.category,
        amount: bill.amount,
        dueDate: bill.dueDate ? dayjs(bill.dueDate) : null,
        isAutoPaid: bill.isAutoPaid || false,
        isPaid: bill.isPaid || false,
        notes: bill.notes || '',
        reminderDays: bill.reminderDays || 3,
        isRecurring: bill.isRecurring || false,
        recurrenceType: bill.recurrenceType || 'monthly',
      });
    } else {
      setEditingBill(null);
      setFormData({
        name: '',
        category: 'Utilities',
        amount: '',
        dueDate: null,
        isAutoPaid: false,
        isPaid: false,
        notes: '',
        reminderDays: 3,
        isRecurring: false,
        recurrenceType: 'monthly',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBill(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        amount: convertToUSD(parseFloat(formData.amount)),
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : '',
      };
      
      if (editingBill) {
        await api.put(`/bills/${editingBill._id}`, submitData);
        toast.success('Bill updated successfully');
      } else {
        await api.post('/bills', submitData);
        toast.success('Bill added successfully');
      }
      handleClose();
      fetchBills();
    } catch (error) {
      toast.error('Failed to save bill');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.delete(`/bills/${id}`);
        toast.success('Bill deleted successfully');
        fetchBills();
      } catch (error) {
        toast.error('Failed to delete bill');
      }
    }
  };

  const handleTogglePaid = async (bill) => {
    try {
      await api.put(`/bills/${bill._id}`, { isPaid: !bill.isPaid });
      toast.success(bill.isPaid ? 'Bill marked as unpaid' : 'Bill marked as paid');
      fetchBills();
    } catch (error) {
      toast.error('Failed to update bill status');
    }
  };

  const getBillStatus = (bill) => {
    if (bill.isPaid) {
      return { color: 'success', text: 'Paid', icon: <CheckCircleIcon /> };
    }

    if (bill.isAutoPaid) {
      return { color: 'info', text: 'Auto-Paid', icon: <PaidIcon /> };
    }

    try {
      const dueDate = parseISO(bill.dueDate);
      const daysUntilDue = differenceInDays(dueDate, new Date());
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        return { color: 'error', text: 'Overdue', icon: <WarningAmberIcon /> };
      }
      if (daysUntilDue <= 3) {
        return { color: 'warning', text: 'Due Soon', icon: <WarningAmberIcon /> };
      }
      return { color: 'default', text: 'Upcoming', icon: null };
    } catch (error) {
      return { color: 'default', text: 'Pending', icon: null };
    }
  };

  const getDaysUntilDue = (bill) => {
    try {
      const dueDate = parseISO(bill.dueDate);
      const days = differenceInDays(dueDate, new Date());
      return days;
    } catch (error) {
      return 0;
    }
  };

  const unpaidBills = bills.filter(b => !b.isPaid);
  const totalMonthlyBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidTotal = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const upcomingBills = bills.filter(b => !b.isPaid && getDaysUntilDue(b) <= 7);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bill Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Bill
        </Button>
      </Box>

      {upcomingBills.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {upcomingBills.length} bill{upcomingBills.length > 1 ? 's' : ''} due within 7 days!
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Monthly Bills
              </Typography>
              <Typography variant="h4" color="primary">
                {formatAmount(totalMonthlyBills)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unpaid Bills
              </Typography>
              <Typography variant="h4" color="error">
                {formatAmount(unpaidTotal)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {unpaidBills.length} bill{unpaidBills.length !== 1 ? 's' : ''} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Upcoming This Week
              </Typography>
              <Typography variant="h4" color="warning.main">
                {upcomingBills.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Days Until Due</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Recurring</TableCell>
              <TableCell>Auto-Paid</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    No bills added yet. Click "Add Bill" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => {
                const status = getBillStatus(bill);
                const daysUntilDue = getDaysUntilDue(bill);

                return (
                  <TableRow key={bill._id} sx={{ opacity: bill.isPaid ? 0.6 : 1 }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={bill.isPaid ? 'normal' : 'bold'}>
                        {bill.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={bill.category} size="small" color="secondary" />
                    </TableCell>
                    <TableCell>{formatAmount(bill.amount)}</TableCell>
                    <TableCell>
                      {bill.dueDate ? format(new Date(bill.dueDate), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {bill.isPaid ? (
                        <Chip label="Paid" size="small" color="success" />
                      ) : (
                        <Typography
                          color={
                            daysUntilDue < 0
                              ? 'error'
                              : daysUntilDue <= 3
                              ? 'warning.main'
                              : 'textSecondary'
                          }
                        >
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} overdue` : `${daysUntilDue} days`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.text}
                        size="small"
                        color={status.color}
                        icon={status.icon}
                      />
                    </TableCell>
                    <TableCell>
                      {bill.isRecurring ? (
                        <Chip label={bill.recurrenceType} size="small" color="info" />
                      ) : (
                        <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bill.isAutoPaid || false}
                            size="small"
                            disabled
                          />
                        }
                        label=""
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleTogglePaid(bill)}
                        color={bill.isPaid ? 'default' : 'success'}
                        title={bill.isPaid ? 'Mark as unpaid' : 'Mark as paid'}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(bill)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(bill._id)}
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
            {editingBill ? 'Edit Bill' : 'Add New Bill'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Bill Name"
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Electric Bill"
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
              {billCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              margin="normal"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
                         <LocalizationProvider dateAdapter={AdapterDayjs}>
               <DatePicker
                 label="Due Date"
                 value={formData.dueDate}
                 onChange={(newValue) => setFormData({ ...formData, dueDate: newValue })}
                 slotProps={{
                   textField: {
                     fullWidth: true,
                     margin: 'normal',
                     required: true,
                   },
                 }}
               />
             </LocalizationProvider>
            <TextField
              fullWidth
              label="Reminder Days"
              type="number"
              margin="normal"
              value={formData.reminderDays}
              onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
              helperText="Days before due date to get reminded"
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              label="Notes"
              margin="normal"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this bill"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
              }
              label="Recurring Bill"
            />
            {formData.isRecurring && (
              <TextField
                select
                fullWidth
                label="Recurrence Type"
                margin="normal"
                value={formData.recurrenceType}
                onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value })}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </TextField>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAutoPaid}
                  onChange={(e) => setFormData({ ...formData, isAutoPaid: e.target.checked })}
                />
              }
              label="Auto-Paid"
            />
            {editingBill && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPaid}
                    onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  />
                }
                label="Mark as Paid"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingBill ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
