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
  Chip,
  LinearProgress,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';
import { formatAmount, convertToUSD } from '../../utils/currency';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const goalIcons = [
  '💰', '🏠', '🚗', '✈️', '🎓', '💍', '🛒', '🏖️', '💻', '📱', '🎮', '🎵',
];

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: null,
    monthlyContribution: '',
    description: '',
    icon: '💰',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to fetch goals');
    }
  };

  const handleOpen = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate ? dayjs(goal.targetDate) : null,
        monthlyContribution: goal.monthlyContribution || '',
        description: goal.description || '',
        icon: goal.icon || '💰',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: null,
        monthlyContribution: '',
        description: '',
        icon: '💰',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        targetDate: formData.targetDate ? formData.targetDate.toISOString() : null,
        targetAmount: convertToUSD(parseFloat(formData.targetAmount)),
        currentAmount: convertToUSD(parseFloat(formData.currentAmount) || 0),
        monthlyContribution: convertToUSD(parseFloat(formData.monthlyContribution) || 0),
      };

      if (editingGoal) {
        await api.put(`/goals/${editingGoal._id}`, submitData);
        toast.success('Goal updated successfully');
      } else {
        await api.post('/goals', submitData);
        toast.success('Goal created successfully');
      }
      handleClose();
      fetchGoals();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        toast.success('Goal deleted successfully');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const handleAddContribution = async (goal) => {
    const amount = window.prompt('Enter contribution amount:');
    if (amount && !isNaN(amount) && amount > 0) {
      try {
        const convertedAmount = convertToUSD(parseFloat(amount));
        const newAmount = parseFloat(goal.currentAmount) + convertedAmount;
        await api.put(`/goals/${goal._id}`, { currentAmount: newAmount });
        toast.success(`Added ${formatAmount(amount)} to ${goal.name}`);
        fetchGoals();
      } catch (error) {
        toast.error('Failed to add contribution');
      }
    }
  };

  const getProgress = (goal) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysUntilTarget = (goal) => {
    if (!goal.targetDate) return null;
    const target = new Date(goal.targetDate);
    const today = new Date();
    const days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getGoalStatus = (goal) => {
    const progress = getProgress(goal);
    const daysUntilTarget = getDaysUntilTarget(goal);

    if (progress >= 100) {
      return { color: 'success', text: 'Completed', icon: <CheckCircleIcon /> };
    }
    if (daysUntilTarget !== null && daysUntilTarget < 0) {
      return { color: 'error', text: 'Overdue', icon: null };
    }
    if (daysUntilTarget !== null && daysUntilTarget <= 30) {
      return { color: 'warning', text: 'Due Soon', icon: null };
    }
    return { color: 'info', text: 'In Progress', icon: <TrendingUpIcon /> };
  };

  const totalTargeted = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalRemaining = totalTargeted - totalSaved;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Savings Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Create Goal
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Targeted
              </Typography>
              <Typography variant="h4" color="primary">
                {formatAmount(totalTargeted)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Saved
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatAmount(totalSaved)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Remaining to Save
              </Typography>
              <Typography variant="h4" color={totalRemaining > 0 ? 'warning.main' : 'success.main'}>
                {formatAmount(totalRemaining)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Goal</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Current</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    No goals created yet. Click "Create Goal" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => {
                const progress = getProgress(goal);
                const status = getGoalStatus(goal);
                const daysUntilTarget = getDaysUntilTarget(goal);

                return (
                  <TableRow key={goal._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5">{goal.icon || '💰'}</Typography>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {goal.name}
                          </Typography>
                          {goal.description && (
                            <Typography variant="caption" color="textSecondary">
                              {goal.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{formatAmount(goal.targetAmount)}</TableCell>
                    <TableCell>{formatAmount(goal.currentAmount)}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
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
                      {goal.targetDate ? (
                        <Box>
                          <Typography variant="body2">
                            {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                          </Typography>
                          {daysUntilTarget !== null && (
                            <Typography variant="caption" color="textSecondary">
                              {daysUntilTarget >= 0 ? `${daysUntilTarget} days left` : `${Math.abs(daysUntilTarget)} days overdue`}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        '-'
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
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleAddContribution(goal)}
                        color="primary"
                        title="Add contribution"
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(goal)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(goal._id)}
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
            {editingGoal ? 'Edit Goal' : 'Create New Savings Goal'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Goal Name"
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Vacation Fund"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Target Amount"
                  type="number"
                  margin="normal"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Current Amount"
                  type="number"
                  margin="normal"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
            </Grid>
                         <LocalizationProvider dateAdapter={AdapterDayjs}>
               <DatePicker
                 label="Target Date"
                 value={formData.targetDate}
                 onChange={(newValue) => setFormData({ ...formData, targetDate: newValue })}
                 slotProps={{
                   textField: {
                     fullWidth: true,
                     margin: 'normal',
                   },
                 }}
               />
             </LocalizationProvider>
            <TextField
              fullWidth
              label="Monthly Contribution"
              type="number"
              margin="normal"
              value={formData.monthlyContribution}
              onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              helperText="How much you plan to save each month"
            />
            <TextField
              fullWidth
              select
              label="Icon"
              margin="normal"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              SelectProps={{ native: true }}
            >
              {goalIcons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of your goal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingGoal ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
