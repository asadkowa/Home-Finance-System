import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export default function IncomeScreen({ navigation }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await api.get('/income');
      setIncomes(response.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      Alert.alert('Error', 'Failed to load incomes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        source: formData.source,
        category: formData.category,
        description: formData.description,
        date: formData.date,
      };

      if (editingIncome) {
        await api.put(`/income/${editingIncome._id}`, payload);
      } else {
        await api.post('/income', payload);
      }

      setModalVisible(false);
      resetForm();
      fetchIncomes();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save income');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Income',
      'Are you sure you want to delete this income?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/income/${id}`);
              fetchIncomes();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete income');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount.toString(),
      source: income.source,
      category: income.category,
      description: income.description,
      date: income.date,
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      source: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingIncome(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Income</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {incomes.map((income) => (
          <View key={income._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardAmount}>${income.amount.toFixed(2)}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(income)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(income._id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cardSource}>{income.source}</Text>
            <Text style={styles.cardCategory}>{income.category}</Text>
            {income.description && (
              <Text style={styles.cardDescription}>{income.description}</Text>
            )}
            <Text style={styles.cardDate}>{new Date(income.date).toLocaleDateString()}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Modal for Add/Edit */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIncome ? 'Edit Income' : 'Add Income'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Source"
              value={formData.source}
              onChangeText={(text) => setFormData({ ...formData, source: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Category"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Date"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  deleteText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  cardSource: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
