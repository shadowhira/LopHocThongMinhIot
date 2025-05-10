import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config/firebase';

const SensorsScreen = () => {
  // Sử dụng giá trị mặc định cho theme để tránh lỗi
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
      success: '#4CAF50',
      error: '#F44336',
    }
  };
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    gas: 0,
    flame: false,
    status: 'AN TOAN',
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sensorsRef = ref(db, 'sensors/current');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSensorData({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          gas: data.gas || 0,
          flame: data.flame || false,
          status: data.status || 'AN TOAN',
          updatedAt: data.updatedAt || null
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error reading sensor data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status) => {
    return status === 'AN TOAN' ? theme.colors.success : theme.colors.error;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          Giám sát cảm biến
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.statusCard, { backgroundColor: getStatusColor(sensorData.status) }]}>
            <Text style={styles.statusText}>
              Trạng thái: {sensorData.status}
            </Text>
            <Text style={styles.updatedText}>
              Cập nhật: {formatTime(sensorData.updatedAt)}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Nhiệt độ
            </Text>
            <Text style={[styles.sensorValue, { color: theme.colors.primary }]}>
              {sensorData.temperature.toFixed(1)}°C
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Độ ẩm
            </Text>
            <Text style={[styles.sensorValue, { color: theme.colors.primary }]}>
              {sensorData.humidity.toFixed(1)}%
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Nồng độ khí gas
            </Text>
            <Text style={[styles.sensorValue, { color: theme.colors.primary }]}>
              {sensorData.gas.toFixed(0)} ppm
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Phát hiện lửa
            </Text>
            <Text style={[styles.sensorValue, { color: sensorData.flame ? theme.colors.error : theme.colors.success }]}>
              {sensorData.flame ? 'PHÁT HIỆN LỬA!' : 'Không phát hiện'}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
  },
  statusCard: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  updatedText: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  card: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SensorsScreen;
