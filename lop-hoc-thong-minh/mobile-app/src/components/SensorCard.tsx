import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SensorData } from '../types';

interface SensorCardProps {
  sensorData: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensorData }) => {
  const { temperature, humidity, gas, flame, motion, lastUpdated } = sensorData;
  
  // Định dạng thời gian cập nhật
  const formattedTime = new Date(lastUpdated).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  // Xác định mức độ nguy hiểm của khí gas
  const getGasLevel = (value: number) => {
    if (value < 150) return 'Bình thường';
    if (value < 300) return 'Cảnh báo';
    return 'Nguy hiểm';
  };
  
  const gasLevel = getGasLevel(gas);
  const gasColor = gas < 150 ? '#4CAF50' : gas < 300 ? '#FF9800' : '#F44336';
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Thông số môi trường</Title>
        <Text style={styles.updateTime}>Cập nhật lúc: {formattedTime}</Text>
        
        <View style={styles.sensorRow}>
          <MaterialCommunityIcons name="thermometer" size={24} color="#F44336" />
          <Text style={styles.sensorLabel}>Nhiệt độ:</Text>
          <Text style={styles.sensorValue}>{temperature}°C</Text>
        </View>
        
        <View style={styles.sensorRow}>
          <MaterialCommunityIcons name="water-percent" size={24} color="#2196F3" />
          <Text style={styles.sensorLabel}>Độ ẩm:</Text>
          <Text style={styles.sensorValue}>{humidity}%</Text>
        </View>
        
        <View style={styles.sensorRow}>
          <MaterialCommunityIcons name="gas-cylinder" size={24} color={gasColor} />
          <Text style={styles.sensorLabel}>Khí gas:</Text>
          <Text style={[styles.sensorValue, { color: gasColor }]}>
            {gas} ({gasLevel})
          </Text>
        </View>
        
        <View style={styles.sensorRow}>
          <MaterialCommunityIcons 
            name="fire" 
            size={24} 
            color={flame ? '#F44336' : '#757575'} 
          />
          <Text style={styles.sensorLabel}>Phát hiện lửa:</Text>
          <Text style={[styles.sensorValue, { color: flame ? '#F44336' : '#4CAF50' }]}>
            {flame ? 'CÓ' : 'Không'}
          </Text>
        </View>
        
        <View style={styles.sensorRow}>
          <MaterialCommunityIcons 
            name="motion-sensor" 
            size={24} 
            color={motion ? '#2196F3' : '#757575'} 
          />
          <Text style={styles.sensorLabel}>Phát hiện chuyển động:</Text>
          <Text style={styles.sensorValue}>
            {motion ? 'CÓ' : 'Không'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  updateTime: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 15,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorLabel: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SensorCard;
