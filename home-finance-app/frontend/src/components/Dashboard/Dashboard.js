import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemText, 
  Chip, LinearProgress, Alert, Avatar, CircularProgress, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../utils/currency';

const COLORS = ['#0EA5E9', '#10B981', '#F43F5E', '#F59E0B', '#06B6D4', '#8B5CF6'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month'); // 'month', 'year', 'week', 'all'
  const { t } = useTranslation();

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    try {
      const [incomeRes, expensesRes, billsRes, goalsRes, debtsRes] = await Promise.all([
        api.get('/income'),
        api.get('/expenses'),
        api.get('/bills'),
        api.get('/goals'),
        api.get('/debts'),
      ]);
      
      setIncome(incomeRes.data);
      setExpenses(expensesRes.data);
      setBills(billsRes.data);
      setGoals(goalsRes.data);
      setDebts(debtsRes.data);
      
      // Calculate summary based on date filter
      const filteredSummary = calculateSummary(incomeRes.data, expensesRes.data);
      setSummary(filteredSummary);
      
      // Calculate recent transactions
      const allTransactions = [
        ...incomeRes.data.map(t => ({ ...t, type: 'income' })),
        ...expensesRes.data.map(t => ({ ...t, type: 'expense' })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentTransactions(allTransactions);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'all':
      default:
        return { start: null, end: null };
    }
  };

  const isInDateRange = (date) => {
    const { start, end } = getDateRange();
    if (!start || !end) return true;
    const transactionDate = new Date(date);
    return transactionDate >= start && transactionDate <= end;
  };

  const calculateSummary = (incomeData, expenseData) => {
    const { start, end } = getDateRange();
    
    let filteredIncome = incomeData;
    let filteredExpenses = expenseData;
    
    if (start && end) {
      filteredIncome = incomeData.filter(item => isInDateRange(item.date));
      filteredExpenses = expenseData.filter(item => isInDateRange(item.date));
    }
    
    const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate expenses by category
    const expensesByCategory = {};
    filteredExpenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    });
    
    const expensesByCategoryArray = Object.entries(expensesByCategory).map(([_id, total]) => ({
      _id,
      total
    }));
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      expensesByCategory: expensesByCategoryArray
    };
  };

  const getDaysUntilDue = (dueDate) => {
    try {
      const due = new Date(dueDate);
      const today = new Date();
      const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return days;
    } catch {
      return 0;
    }
  };

  const upcomingBills = bills
    .filter(bill => !bill.isPaid)
    .map(bill => ({
      ...bill,
      daysUntilDue: getDaysUntilDue(bill.dueDate),
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 5);

  const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 3);

  const getGoalProgress = (goal) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  // Debt analysis functions
  const calculateDebtStats = () => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    const totalMinPayment = debts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0);
    const averageInterest = debts.length > 0 
      ? debts.reduce((sum, debt) => sum + (debt.interestRate || 0), 0) / debts.length 
      : 0;
    
    return { totalDebt, totalMinPayment, averageInterest };
  };

  const debtStats = calculateDebtStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const expensesData = summary?.expensesByCategory?.map(item => ({
    name: item._id,
    value: item.total
  })) || [];

  const hasUpcomingBills = upcomingBills.some(b => b.daysUntilDue <= 7);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('dashboard.title')}
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('dashboard.dateFilter') || 'Date Range'}</InputLabel>
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            label={t('dashboard.dateFilter') || 'Date Range'}
          >
            <MenuItem value="week">{t('dashboard.thisWeek') || 'This Week'}</MenuItem>
            <MenuItem value="month">{t('dashboard.thisMonth') || 'This Month'}</MenuItem>
            <MenuItem value="year">{t('dashboard.thisYear') || 'This Year'}</MenuItem>
            <MenuItem value="all">{t('dashboard.allTime') || 'All Time'}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {hasUpcomingBills && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            {t('dashboard.upcomingBillsWarning.title')}
          </Typography>
          {upcomingBills.filter(b => b.daysUntilDue <= 7).map(bill => (
            <Typography key={bill._id} variant="body2">
              • {bill.name}: {formatAmount(bill.amount)} {t('dashboard.upcomingBillsWarning.dueInDays', { days: bill.daysUntilDue })}
            </Typography>
          ))}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  {t('dashboard.totalIncome.title')}
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatAmount(summary?.totalIncome || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  {t('dashboard.totalExpenses.title')}
                </Typography>
              </Box>
              <Typography variant="h4" color="error">
                {formatAmount(summary?.totalExpenses || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccountBalanceIcon color={summary?.balance >= 0 ? 'success' : 'error'} sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  {t('dashboard.balance.title')}
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                color={summary?.balance >= 0 ? 'success.main' : 'error.main'}
              >
                {formatAmount(summary?.balance || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  {t('dashboard.savingsRate.title')}
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {summary?.totalIncome && summary?.totalIncome > 0
                  ? `${((summary.balance / summary.totalIncome) * 100).toFixed(1)}%`
                  : '0%'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Debt Analysis Cards */}
        {debts.length > 0 && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccountBalanceIcon color="warning" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" variant="body2">
                      {t('dashboard.totalDebt.title') || 'Total Debt'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {formatAmount(debtStats.totalDebt)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" variant="body2">
                      {t('dashboard.minMonthlyPayment.title') || 'Min. Monthly Payment'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="error">
                    {formatAmount(debtStats.totalMinPayment)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" variant="body2">
                      {t('dashboard.avgInterestRate.title') || 'Avg. Interest Rate'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {debtStats.averageInterest.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.expensesByCategory.title')}
              </Typography>
              {expensesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#0EA5E9"
                      dataKey="value"
                    >
                      {expensesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                  {t('dashboard.expensesByCategory.noData')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  {t('dashboard.upcomingBills.title')}
                </Typography>
              </Box>
              {upcomingBills.length > 0 ? (
                <List>
                  {upcomingBills.map((bill) => (
                    <ListItem key={bill._id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={bill.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {formatAmount(bill.amount)}
                              {' • '}
                              {bill.dueDate && format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={bill.daysUntilDue <= 3 ? 'error.main' : bill.daysUntilDue <= 7 ? 'warning.main' : 'text.secondary'}
                            >
                              {bill.daysUntilDue < 0 ? t('dashboard.upcomingBills.overdueDays', { days: Math.abs(bill.daysUntilDue) })
                               : bill.daysUntilDue === 0 ? t('dashboard.upcomingBills.dueToday')
                               : t('dashboard.upcomingBills.daysLeft', { days: bill.daysUntilDue })}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={bill.category} 
                        size="small" 
                        color="secondary" 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                  {t('dashboard.upcomingBills.noUpcomingBills')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.activeSavingsGoals.title')}
              </Typography>
              {activeGoals.length > 0 ? (
                <List>
                  {activeGoals.map((goal) => {
                    const progress = getGoalProgress(goal);
                    return (
                      <ListItem key={goal._id} sx={{ px: 0 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {goal.icon || '💰'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="body1" fontWeight="bold">
                              {goal.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {progress.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            color="primary"
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {formatAmount(goal.currentAmount)} {t('dashboard.activeSavingsGoals.of')} {formatAmount(goal.targetAmount)}
                          </Typography>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                  {t('dashboard.activeSavingsGoals.noActiveGoals')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.recentTransactions.title')}
              </Typography>
              {recentTransactions.length > 0 ? (
                <List>
                  {recentTransactions.map((transaction) => (
                    <ListItem key={transaction._id} sx={{ px: 0 }}>
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          bgcolor: transaction.type === 'income' ? 'success.main' : 'error.main' 
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">
                              {transaction.type === 'income' ? transaction.source : transaction.category}
                            </Typography>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold"
                              color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                            >
                              {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
                            </Typography>
                          </Box>
                        }
                        secondary={format(new Date(transaction.date), 'MMM dd, yyyy')}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                  {t('dashboard.recentTransactions.noRecentTransactions')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
