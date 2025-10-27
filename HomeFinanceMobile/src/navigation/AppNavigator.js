import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import BillsScreen from '../screens/BillsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import DebtsScreen from '../screens/DebtsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeScreen}
        options={{
          tabBarLabel: 'Income',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>💸</Text>,
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          tabBarLabel: 'Budgets',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📈</Text>,
        }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          tabBarLabel: 'Bills',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🧾</Text>,
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarLabel: 'Goals',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🎯</Text>,
        }}
      />
      <Tab.Screen
        name="Debts"
        component={DebtsScreen}
        options={{
          tabBarLabel: 'Debts',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>💳</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
