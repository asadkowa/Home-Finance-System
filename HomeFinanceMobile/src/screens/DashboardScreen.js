import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, PieChart } from 'react-native-chart-kit';
import api from '../config/api';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    fetchDashboardData();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.subtitle}>Here's your financial overview</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <View style={[styles.card, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.cardLabel}>Total Income</Text>
          <Text style={[styles.cardValue, { color: '#10B981' }]}>
            ${summary?.totalIncome?.toFixed(2) || '0.00'}
          </Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.cardLabel}>Total Expenses</Text>
          <Text style={[styles.cardValue, { color: '#EF4444' }]}>
            ${summary?.totalExpenses?.toFixed(2) || '0.00'}
          </Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#0EA5E9' }]}>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text style={[styles.cardValue, { color: '#0EA5E9' }]}>
            ${summary?.balance?.toFixed(2) || '0.00'}
          </Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.cardLabel}>Savings Rate</Text>
          <Text style={[styles.cardValue, { color: '#F59E0B' }]}>
            {summary?.savingsRate?.toFixed(1) || '0'}%
          </Text>
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsContainer}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        
        {/* Line Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Income vs Expenses</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  data: [summary?.totalIncome || 0, summary?.totalIncome || 0, summary?.totalIncome || 0, summary?.totalIncome || 0, summary?.totalIncome || 0, summary?.totalIncome || 0],
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 2
                },
                {
                  data: [summary?.totalExpenses || 0, summary?.totalExpenses || 0, summary?.totalExpenses || 0, summary?.totalExpenses || 0, summary?.totalExpenses || 0, summary?.totalExpenses || 0],
                  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  strokeWidth: 2
                },
              ],
              legend: ['Income', 'Expenses'],
            }}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#0EA5E9'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Spending Breakdown</Text>
          <PieChart
            data={[
              {
                name: 'Income',
                amount: summary?.totalIncome || 1,
                color: '#10B981',
                legendFontColor: '#333',
                legendFontSize: 14,
              },
              {
                name: 'Expenses',
                amount: summary?.totalExpenses || 0,
                color: '#EF4444',
                legendFontColor: '#333',
                legendFontSize: 14,
              },
            ]}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionEmoji}>💰</Text>
            <Text style={styles.actionText}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionEmoji}>💸</Text>
            <Text style={styles.actionText}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionText}>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionEmoji}>🎯</Text>
            <Text style={styles.actionText}>Goals</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
  cardsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chartsContainer: {
    padding: 20,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
});
