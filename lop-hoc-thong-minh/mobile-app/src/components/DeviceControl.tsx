import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Devices } from '../types';

interface DeviceControlProps {
  devices: Devices;
  onDoorControl: (action: 'open' | 'closed') => Promise<boolean>;
  onLightControl: (action: 'on' | 'off') => Promise<boolean>;
  onAutoModeToggle: (device: 'door' | 'light', autoMode: boolean) => Promise<boolean>;
}

const DeviceControl: React.FC<DeviceControlProps> = ({
  devices,
  onDoorControl,
  onLightControl,
  onAutoModeToggle,
}) => {
  const { door, light } = devices;
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Điều khiển thiết bị</Title>
        
        {/* Điều khiển cửa */}
        <View style={styles.deviceSection}>
          <View style={styles.deviceHeader}>
            <MaterialCommunityIcons 
              name="door" 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.deviceName}>Cửa</Text>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText, 
                { color: door.status === 'open' ? '#4CAF50' : '#F44336' }
              ]}>
                {door.status === 'open' ? 'Đang mở' : 'Đang đóng'}
              </Text>
            </View>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.autoText}>Chế độ tự động:</Text>
            <Switch
              value={door.auto}
              onValueChange={(value) => onAutoModeToggle('door', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={door.auto ? '#2196F3' : '#f4f3f4'}
            />
          </View>
          
          {!door.auto && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4CAF50' }]}
                onPress={() => onDoorControl('open')}
                disabled={door.status === 'open'}
              >
                <Text style={styles.buttonText}>Mở cửa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#F44336' }]}
                onPress={() => onDoorControl('closed')}
                disabled={door.status === 'closed'}
              >
                <Text style={styles.buttonText}>Đóng cửa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Điều khiển đèn */}
        <View style={styles.deviceSection}>
          <View style={styles.deviceHeader}>
            <MaterialCommunityIcons 
              name="lightbulb" 
              size={24} 
              color={light.status === 'on' ? '#FFC107' : '#757575'} 
            />
            <Text style={styles.deviceName}>Đèn</Text>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText, 
                { color: light.status === 'on' ? '#4CAF50' : '#F44336' }
              ]}>
                {light.status === 'on' ? 'Đang bật' : 'Đang tắt'}
              </Text>
            </View>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.autoText}>Chế độ tự động:</Text>
            <Switch
              value={light.auto}
              onValueChange={(value) => onAutoModeToggle('light', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={light.auto ? '#2196F3' : '#f4f3f4'}
            />
          </View>
          
          {!light.auto && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4CAF50' }]}
                onPress={() => onLightControl('on')}
                disabled={light.status === 'on'}
              >
                <Text style={styles.buttonText}>Bật đèn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#F44336' }]}
                onPress={() => onLightControl('off')}
                disabled={light.status === 'off'}
              >
                <Text style={styles.buttonText}>Tắt đèn</Text>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: 15,
  },
  deviceSection: {
    marginBottom: 20,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusText: {
    fontWeight: 'bold',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  autoText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DeviceControl;
