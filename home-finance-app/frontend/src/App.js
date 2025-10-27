import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n/config';
import { useTranslation } from 'react-i18next';
import i18n from './i18n/config';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/Auth/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import IncomePage from './components/Income/IncomePage';
import ExpensesPage from './components/Expenses/ExpensesPage';
import BudgetsPage from './components/Budgets/BudgetsPage';
import BillsPage from './components/Bills/BillsPage';
import GoalsPage from './components/Goals/GoalsPage';
import DebtsPage from './components/Debts/DebtsPage';
import SettingsPage from './components/Settings/SettingsPage';
import ReportsPage from './components/Reports/ReportsPage';
import Layout from './components/Layout/Layout';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/landing" />;
};

function App() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');
  const [direction, setDirection] = useState(localStorage.getItem('rtl') === 'true' ? 'rtl' : 'ltr');

  // Update HTML dir attribute when direction changes
  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
  }, [direction]);

  const theme = useMemo(() => {
    return createTheme({
      direction,
      palette: {
        mode: themeMode,
        primary: {
          main: '#0EA5E9', // Modern sky blue
          light: '#38BDF8',
          dark: '#0284C7',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#06B6D4', // Cyan accent
          light: '#22D3EE',
          dark: '#0891B2',
        },
        error: {
          main: '#F43F5E',
          light: '#FB7185',
          dark: '#E11D48',
        },
        warning: {
          main: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        success: {
          main: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        info: {
          main: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        background: {
          default: themeMode === 'dark' ? '#0F172A' : '#F8FAFC',
          paper: themeMode === 'dark' ? '#1E293B' : '#FFFFFF',
        },
        text: {
          primary: themeMode === 'dark' ? '#F1F5F9' : '#0F172A',
          secondary: themeMode === 'dark' ? '#94A3B8' : '#64748B',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.2,
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1.3,
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        button: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
      shape: {
        borderRadius: 12,
      },
      shadows: [
        'none',
        '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      ],
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              padding: '10px 24px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            },
            contained: {
              background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 10,
                '&:hover fieldset': {
                  borderColor: '#0EA5E9',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0EA5E9',
                  borderWidth: '2px',
                },
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 500,
            },
          },
        },
      },
    });
  }, [direction, themeMode]);

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
  };

  const handleLanguageChange = (lang) => {
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    // Update RTL based on language
    if (lang === 'ar') {
      const newDirection = 'rtl';
      setDirection(newDirection);
      localStorage.setItem('rtl', 'true');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      const newDirection = 'ltr';
      setDirection(newDirection);
      localStorage.setItem('rtl', 'false');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  };

  const handleRtlChange = (isRtl) => {
    const newDirection = isRtl ? 'rtl' : 'ltr';
    setDirection(newDirection);
    localStorage.setItem('rtl', isRtl.toString());
    document.documentElement.setAttribute('dir', newDirection);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="income" element={<IncomePage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="debts" element={<DebtsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route 
                path="settings" 
                element={
                  <SettingsPage 
                    onThemeChange={handleThemeChange}
                    onLanguageChange={handleLanguageChange}
                    onRtlChange={handleRtlChange}
                  />
                } 
              />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
