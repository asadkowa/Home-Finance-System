import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { formatAmount, getUserCurrency, getCurrencySymbol, convertFromUSD } from '../../utils/currency';

export default function ReportsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchPaymentLogs();
  }, []);

  const fetchPaymentLogs = async () => {
    try {
      setLoading(true);
      
      // Fetch all income, expenses, bills, and debt payments
      const [incomeRes, expensesRes, billsRes, debtPaymentsRes] = await Promise.all([
        api.get('/income'),
        api.get('/expenses'),
        api.get('/bills'),
        api.get('/debt-payments'),
      ]);

      const allIncome = incomeRes.data.map(item => ({
        ...item,
        type: 'Income',
        amount: item.amount,
        date: item.date,
        category: item.source || item.category,
      }));

      const allExpenses = expensesRes.data.map(item => ({
        ...item,
        type: 'Expense',
        amount: -item.amount,
        date: item.date,
        category: item.category,
      }));

      const allBillPayments = billsRes.data
        .filter(bill => bill.isPaid)
        .map(bill => ({
          ...bill,
          type: 'Bill Payment',
          amount: -bill.amount,
          date: bill.dueDate || new Date().toISOString(),
          category: bill.category,
        }));

      const allDebtPayments = debtPaymentsRes.data.map(payment => ({
        ...payment,
        type: 'Debt Payment',
        amount: -payment.amount,
        date: payment.paymentDate,
        category: payment.debt?.type || 'Debt',
        description: payment.description || `${payment.debt?.name || 'Debt'} payment`,
      }));

      const allPayments = [...allIncome, ...allExpenses, ...allBillPayments, ...allDebtPayments]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setPayments(allPayments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment logs:', error);
      toast.error('Failed to load payment logs');
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    let filtered = payments;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.date);
        switch (dateFilter) {
          case 'today':
            return paymentDate.toDateString() === now.toDateString();
          case 'week':
            return paymentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return paymentDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case 'year':
            return paymentDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredPayments = getFilteredPayments();

  const totalIncome = filteredPayments
    .filter(p => p.amount > 0)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpenses = filteredPayments
    .filter(p => p.amount < 0)
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  const exportToCSV = () => {
    const userCurrency = getUserCurrency();
    const symbol = getCurrencySymbol(userCurrency);
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Status'];
    const rows = filteredPayments.map(p => {
      const convertedAmount = convertFromUSD(Math.abs(p.amount), userCurrency);
      return [
        format(new Date(p.date), 'yyyy-MM-dd HH:mm'),
        p.type,
        p.category || '-',
        p.description || p.name || '-',
        p.amount > 0 ? `+${symbol}${convertedAmount.toFixed(2)}` : `-${symbol}${convertedAmount.toFixed(2)}`,
        'Completed'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Report exported successfully');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Payment Reports
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Export Report">
            <IconButton onClick={exportToCSV} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box display="flex" gap={2} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Transactions
            </Typography>
            <Typography variant="h4" color="primary">
              {filteredPayments.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4" color="success.main">
              {formatAmount(totalIncome)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" color="error">
              {formatAmount(totalExpenses)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Net Amount
            </Typography>
            <Typography 
              variant="h4" 
              color={totalIncome - totalExpenses >= 0 ? 'success.main' : 'error'}
            >
              {formatAmount(totalIncome - totalExpenses)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <FilterListIcon color="action" />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Income">Income</MenuItem>
                <MenuItem value="Expense">Expense</MenuItem>
                <MenuItem value="Bill Payment">Bill Payment</MenuItem>
                <MenuItem value="Debt Payment">Debt Payment</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Payment Logs Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Loading...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                        No payment records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id} hover>
                      <TableCell>
                        {format(new Date(payment.date), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.type} 
                          size="small" 
                          color={
                            payment.type === 'Income' ? 'success' : 
                            payment.type === 'Expense' ? 'error' :
                            payment.type === 'Bill Payment' ? 'warning' :
                            payment.type === 'Debt Payment' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{payment.category || '-'}</TableCell>
                      <TableCell>
                        {payment.description || payment.name || payment.source || '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={payment.amount >= 0 ? 'success.main' : 'error.main'}
                        >
                          {payment.amount >= 0 ? '+' : ''}{formatAmount(Math.abs(payment.amount))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label="Completed" size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
