# Mobile App Integration Guide

This guide explains how to build a native mobile app (iOS/Android) that integrates with the Home Finance System API.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [API Integration](#api-integration)
4. [Authentication Flow](#authentication-flow)
5. [Push Notifications](#push-notifications)
6. [State Management](#state-management)
7. [UI Components](#ui-components)
8. [Platform-Specific Features](#platform-specific-features)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Mobile App                   │
│  ┌──────────┐  ┌──────────┐         │
│  │  UI      │  │  State   │         │
│  │  Layer   │  │  Mgmt    │         │
│  └────┬─────┘  └────┬─────┘         │
│       │             │               │
│  ┌────┴─────────────┴─────┐         │
│  │   API Service Layer    │         │
│  └────────────┬───────────┘         │
└───────────────┼─────────────────────┘
                │
                │ HTTPS
                │
┌───────────────┴───────────┐
│      Backend API          │
│   http://localhost:5000   │
└───────────────────────────┘
```

---

## Technology Stack

### Cross-Platform (Recommended)
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling

### Native Development
- **iOS**: Swift + SwiftUI
- **Android**: Kotlin + Jetpack Compose

### Recommended Libraries

#### React Native Setup
```bash
npm install --global expo-cli
npx create-expo-app HomeFinanceMobile
cd HomeFinanceMobile
```

#### Essential Dependencies
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react-navigation": "^6.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-push-notification": "^8.1.1",
    "react-native-biometrics": "^3.0.1",
    "@react-native-community/datetimepicker": "^7.6.0",
    "react-native-paper": "^5.11.0",
    "react-query": "^3.39.0"
  }
}
```

---

## API Integration

### Base Configuration

Create `src/config/api.js`:

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.removeItem('token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Service Examples

Create `src/services/incomeService.js`:

```javascript
import api from '../config/api';

export const incomeService = {
  getAll: async () => {
    const response = await api.get('/income');
    return response.data;
  },

  create: async (income) => {
    const response = await api.post('/income', income);
    return response.data;
  },

  update: async (id, income) => {
    const response = await api.put(`/income/${id}`, income);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  },
};
```

Repeat for other services:
- `expenseService.js`
- `budgetService.js`
- `billService.js`
- `goalService.js`
- `debtService.js`
- `notificationService.js`
- `dashboardService.js`

---

## Authentication Flow

### Login Screen

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} disabled={loading} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}
```

### Protected Route Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProtectedRoute({ children, navigation }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
    } else {
      navigation.replace('Login');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return authenticated ? children : null;
}
```

---

## Push Notifications

### Setup (React Native)

1. Install dependencies:
```bash
npm install react-native-push-notification @react-native-community/push-notification-ios
```

2. Configure for Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

3. Configure for iOS (`ios/Podfile`):
```ruby
platform :ios, '10.0'
use_frameworks!

target 'HomeFinanceMobile' do
  # Add this
  pod 'RNCPushNotificationIOS', :path => '../node_modules/@react-native-community/push-notification-ios'
end
```

### Push Notification Service

Create `src/services/pushNotificationService.js`:

```javascript
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PushNotificationService {
  configure() {
    PushNotification.configure({
      onRegister: async (token) => {
        console.log('TOKEN:', token);
        await AsyncStorage.setItem('pushToken', token.token);
        // Send token to backend
        await this.sendTokenToBackend(token.token);
      },

      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
        // Handle notification tap
        if (notification.userInteraction) {
          // Navigate to specific screen
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create default channel (Android)
    PushNotification.createChannel(
      {
        channelId: 'home-finance',
        channelName: 'Home Finance Notifications',
        channelDescription: 'Notifications for bills, budgets, and goals',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  async sendTokenToBackend(token) {
    try {
      // Send token to your backend
      await api.post('/notifications/register-device', { token });
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  showNotification(title, message, data = {}) {
    PushNotification.localNotification({
      channelId: 'home-finance',
      title,
      message,
      data,
      vibrate: true,
      vibration: 300,
    });
  }
}

export default new PushNotificationService();
```

---

## State Management

### Using React Query

```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { incomeService } from '../services/incomeService';

export function useIncomes() {
  return useQuery('incomes', incomeService.getAll);
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  
  return useMutation(incomeService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('incomes');
    },
  });
}

// Usage in component
function IncomeScreen() {
  const { data, isLoading } = useIncomes();
  const createIncome = useCreateIncome();

  const handleAdd = () => {
    createIncome.mutate({
      amount: 1000,
      source: 'Salary',
      // ...
    });
  };

  if (isLoading) return <Loading />;

  return (
    // Render income list
  );
}
```

---

## UI Components

### Custom Dashboard Card

```javascript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function DashboardCard({ title, value, icon, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### Transaction List Item

```javascript
export default function TransactionItem({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(item)}>
      <View style={styles.iconCircle}>
        <Icon name="attach-money" size={20} color="#fff" />
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      <Text style={[styles.amount, { color: item.amount > 0 ? '#10B981' : '#EF4444' }]}>
        {item.amount > 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}
```

---

## Platform-Specific Features

### Biometric Authentication

```javascript
import ReactNativeBiometrics from 'react-native-biometrics';

export async function authenticateWithBiometrics() {
  const rnBiometrics = new ReactNativeBiometrics();

  const { available, biometryType } = await rnBiometrics.isSensorAvailable();

  if (available) {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Confirm fingerprint',
    });

    return success;
  }

  return false;
}
```

### Date Picker

```javascript
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePicker({ value, onChange, mode = 'date' }) {
  return (
    <DateTimePicker
      value={value || new Date()}
      mode={mode}
      display="default"
      onChange={(event, selectedDate) => onChange(selectedDate)}
    />
  );
}
```

---

## Testing

### Unit Tests (Jest)

```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';

describe('LoginScreen', () => {
  it('should login successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });
});
```

---

## Deployment

### iOS (App Store)

1. Configure signing in Xcode
2. Archive the app: `Product > Archive`
3. Upload to App Store Connect
4. Submit for review

### Android (Play Store)

1. Generate signed APK:
```bash
cd android
./gradlew assembleRelease
```

2. Create app listing in Play Console
3. Upload APK/AAB
4. Submit for review

---

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Navigation](https://reactnavigation.org/)

---

## Support

For API-related questions, refer to `API_DOCUMENTATION.md`.
For backend setup, refer to the main `README.md`.
