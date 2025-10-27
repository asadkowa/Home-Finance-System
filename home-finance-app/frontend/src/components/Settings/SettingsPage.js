import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

// Import translation files
import enTranslations from '../../i18n/locales/en.json';
import arTranslations from '../../i18n/locales/ar.json';

export default function SettingsPage({ onThemeChange, onLanguageChange, onRtlChange }) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('expense');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [rtl, setRtl] = useState(localStorage.getItem('rtl') === 'true');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
  const [currencies, setCurrencies] = useState([]);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  
  // Translation editing state
  const [translations, setTranslations] = useState(enTranslations);
  const [translationKey, setTranslationKey] = useState('');
  const [translationValue, setTranslationValue] = useState('');
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [openTranslationDialog, setOpenTranslationDialog] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSettings();
    loadTranslations();
    loadCurrencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTranslations = () => {
    try {
      const savedTranslations = localStorage.getItem(`translations_${language}`);
      if (savedTranslations) {
        setTranslations(JSON.parse(savedTranslations));
      } else {
        // Load default translations based on language
        setTranslations(language === 'ar' ? arTranslations : enTranslations);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      setTranslations(language === 'ar' ? arTranslations : enTranslations);
    }
  };

  const saveTranslations = () => {
    try {
      localStorage.setItem(`translations_${language}`, JSON.stringify(translations));
      // Update i18n with the new translations
      i18n.addResourceBundle(language, 'translation', translations, true, true);
      toast.success('Translations saved successfully! Please refresh the page to see changes.');
    } catch (error) {
      toast.error('Failed to save translations');
    }
  };

  const loadCurrencies = async () => {
    try {
      const response = await api.get('/currency/list');
      setCurrencies(response.data.currencies);
    } catch (error) {
      console.error('Error loading currencies:', error);
      toast.error('Failed to load currencies');
    }
  };

  const handleCurrencyChange = async (event) => {
    const newCurrency = event.target.value;
    try {
      await api.put('/auth/currency', { currency: newCurrency });
      setCurrency(newCurrency);
      localStorage.setItem('currency', newCurrency);
      toast.success(`Currency changed to ${newCurrency}`);
    } catch (error) {
      toast.error('Failed to update currency');
    }
  };

  const handleEditTranslation = (key, value) => {
    setTranslationKey(key);
    setTranslationValue(value);
    setIsEditingTranslation(true);
    setOpenTranslationDialog(true);
  };

  const handleSaveTranslation = () => {
    if (!translationKey || !translationValue) {
      toast.error('Please fill in both key and value');
      return;
    }

    // Update the translation value in the translations object
    const newTranslations = { ...translations };
    
    // Handle nested keys like "nav.dashboard" or "dashboard.totalIncome"
    const keys = translationKey.split('.');
    let current = newTranslations;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = translationValue;
    
    setTranslations(newTranslations);
    setIsEditingTranslation(false);
    setOpenTranslationDialog(false);
    setTranslationKey('');
    setTranslationValue('');
    toast.success('Translation updated');
  };

  const flattenTranslations = (obj, prefix = '') => {
    let result = [];
    for (let key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result = result.concat(flattenTranslations(obj[key], newKey));
      } else {
        result.push({ key: newKey, value: obj[key] });
      }
    }
    return result;
  };

  const translationList = flattenTranslations(translations);

  const loadCategories = async () => {
    try {
      // Load predefined categories
      const expenseCategories = [
        'Housing', 'Utilities', 'Food', 'Transportation', 'Healthcare',
        'Entertainment', 'Education', 'Shopping', 'Savings & Investments',
        'Debt Payments', 'Insurance', 'Personal Care', 'Gifts & Donations', 'Miscellaneous'
      ];
      const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];
      const billCategories = [
        'Utilities', 'Internet', 'Phone', 'Insurance', 'Rent/Mortgage',
        'Credit Card', 'Loan Payment', 'Subscription', 'Healthcare', 'Other'
      ];
      
      setCategories([
        { type: 'expense', name: 'Expense Categories', items: expenseCategories },
        { type: 'income', name: 'Income Categories', items: incomeCategories },
        { type: 'bill', name: 'Bill Categories', items: billCategories }
      ]);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const loadSettings = () => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    const savedRtl = localStorage.getItem('rtl');
    const savedCurrency = localStorage.getItem('currency');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      onThemeChange('dark');
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
      onLanguageChange(savedLanguage);
    }
    if (savedRtl === 'true') {
      setRtl(true);
      onRtlChange(true);
    }
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const categoryIndex = categories.findIndex(c => c.type === selectedCategoryType);
      if (categoryIndex !== -1) {
        const updatedCategories = [...categories];
        if (!updatedCategories[categoryIndex].items.includes(newCategory)) {
          updatedCategories[categoryIndex].items.push(newCategory);
          setCategories(updatedCategories);
          setNewCategory('');
          setOpenCategoryDialog(false);
          toast.success('Category added successfully');
        } else {
          toast.error('Category already exists');
        }
      }
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = (categoryType, categoryName) => {
    const categoryIndex = categories.findIndex(c => c.type === categoryType);
    if (categoryIndex !== -1) {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].items = updatedCategories[categoryIndex].items.filter(
        item => item !== categoryName
      );
      setCategories(updatedCategories);
      toast.success('Category deleted successfully');
    }
  };

  const handleThemeToggle = (event) => {
    const isDark = event.target.checked;
    setDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    onThemeChange(isDark ? 'dark' : 'light');
    toast.success(`Switched to ${isDark ? 'dark' : 'light'} mode`);
  };

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    i18n.changeLanguage(newLang);
    onLanguageChange(newLang);
    const langNames = { en: 'English', ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German' };
    toast.success(`Language changed to ${langNames[newLang] || newLang}`);
  };

  const handleRtlToggle = (event) => {
    const isRtl = event.target.checked;
    setRtl(isRtl);
    localStorage.setItem('rtl', isRtl.toString());
    onRtlChange(isRtl);
    toast.success(`Switched to ${isRtl ? 'RTL' : 'LTR'} mode`);
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      toast.success('Password changed successfully');
      setOpenPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/auth/account');
        toast.success('Account deleted successfully');
        // Redirect to login
        window.location.href = '/login';
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          {t('settings.title')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Categories Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CategoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Manage Categories</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Add or remove categories for expenses, income, and bills
              </Typography>

              <Select
                fullWidth
                value={selectedCategoryType}
                onChange={(e) => setSelectedCategoryType(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="expense">Expense Categories</MenuItem>
                <MenuItem value="income">Income Categories</MenuItem>
                <MenuItem value="bill">Bill Categories</MenuItem>
              </Select>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenCategoryDialog(true)}
                sx={{ mb: 2 }}
              >
                Add New Category
              </Button>

              <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {categories
                    .find(c => c.type === selectedCategoryType)?.items.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteCategory(selectedCategoryType, item)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* User Account Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Account Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenPasswordDialog(true)}
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>

              <Alert severity="warning" sx={{ mb: 2 }}>
                Delete account will permanently remove all your data.
              </Alert>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DarkModeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={handleThemeToggle}
                  />
                }
                label={darkMode ? t('settings.darkMode') : t('settings.lightMode')}
                sx={{ mb: 2, width: '100%', justifyContent: 'space-between', m: 0 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Language & RTL Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LanguageIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Language & Display</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ar">Arabic (العربية)</MenuItem>
                  <MenuItem value="fr">French (Français)</MenuItem>
                  <MenuItem value="es">Spanish (Español)</MenuItem>
                  <MenuItem value="de">German (Deutsch)</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={rtl}
                    onChange={handleRtlToggle}
                  />
                }
                label="Right-to-Left (RTL) Layout"
                sx={{ width: '100%', justifyContent: 'space-between', m: 0 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CurrencyExchangeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Currency Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Currency</InputLabel>
                <Select
                  value={currency}
                  onChange={handleCurrencyChange}
                  label="Select Currency"
                >
                  {currencies.map((curr) => (
                    <MenuItem key={curr.code} value={curr.code}>
                      {curr.symbol} - {curr.name} ({curr.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" color="textSecondary">
                All amounts will be displayed in the selected currency. 
                Exchange rates are approximate and updated periodically.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Translation Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <LanguageIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Translation Management ({language.toUpperCase()})</Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={saveTranslations}
                >
                  Save All Translations
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Edit any translation by clicking on the edit icon. Changes are saved to localStorage.
              </Alert>

              <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                  {translationList.slice(0, 50).map((item) => (
                    <ListItem key={item.key} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {item.key}
                            </Typography>
                          </Box>
                        }
                        secondary={item.value}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleEditTranslation(item.key, item.value)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                Showing first 50 translations. Total: {translationList.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            margin="normal"
            placeholder={`Enter ${selectedCategoryType} category name`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordData.current}
            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordData.new}
            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Translation Dialog */}
      <Dialog 
        open={openTranslationDialog} 
        onClose={() => {
          setOpenTranslationDialog(false);
          setIsEditingTranslation(false);
          setTranslationKey('');
          setTranslationValue('');
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Edit Translation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Translation Key"
            value={translationKey}
            onChange={(e) => setTranslationKey(e.target.value)}
            margin="normal"
            disabled
            helperText="This is the key used in the application"
          />
          <TextField
            fullWidth
            label="Translation Value"
            value={translationValue}
            onChange={(e) => setTranslationValue(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            helperText="Edit the translated text here"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenTranslationDialog(false);
              setIsEditingTranslation(false);
              setTranslationKey('');
              setTranslationValue('');
            }}
          >
            <CancelIcon sx={{ mr: 1 }} />
            Cancel
          </Button>
          <Button onClick={handleSaveTranslation} variant="contained">
            <SaveIcon sx={{ mr: 1 }} />
            Save Translation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
