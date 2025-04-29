import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SensorData } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface SensorCardProps {
  sensorData: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensorData }) => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

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
  const gasColor = gas < 150 ? theme.success : gas < 300 ? theme.warning : theme.error;

  return (
    <Card style={{
      marginVertical: 10,
      marginHorizontal: 16,
      elevation: 4,
      backgroundColor: theme.card,
    }}>
      <Card.Content>
        <Title style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 5,
          color: theme.text.primary,
        }}>Thông số môi trường</Title>
        <Text style={{
          fontSize: 12,
          color: theme.text.secondary,
          marginBottom: 15,
        }}>Cập nhật lúc: {formattedTime}</Text>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <MaterialCommunityIcons name="thermometer" size={24} color={theme.flame} />
          <Text style={{
            fontSize: 16,
            marginLeft: 10,
            flex: 1,
            color: theme.text.primary,
          }}>Nhiệt độ:</Text>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text.primary,
          }}>{temperature}°C</Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <MaterialCommunityIcons name="water-percent" size={24} color={theme.humidity} />
          <Text style={{
            fontSize: 16,
            marginLeft: 10,
            flex: 1,
            color: theme.text.primary,
          }}>Độ ẩm:</Text>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text.primary,
          }}>{humidity}%</Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <MaterialCommunityIcons name="gas-cylinder" size={24} color={gasColor} />
          <Text style={{
            fontSize: 16,
            marginLeft: 10,
            flex: 1,
            color: theme.text.primary,
          }}>Khí gas:</Text>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: gasColor,
          }}>
            {gas} ({gasLevel})
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <MaterialCommunityIcons
            name="fire"
            size={24}
            color={flame ? theme.flame : theme.text.disabled}
          />
          <Text style={{
            fontSize: 16,
            marginLeft: 10,
            flex: 1,
            color: theme.text.primary,
          }}>Phát hiện lửa:</Text>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: flame ? theme.flame : theme.success,
          }}>
            {flame ? 'CÓ' : 'Không'}
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <MaterialCommunityIcons
            name="motion-sensor"
            size={24}
            color={motion ? theme.motion : theme.text.disabled}
          />
          <Text style={{
            fontSize: 16,
            marginLeft: 10,
            flex: 1,
            color: theme.text.primary,
          }}>Phát hiện chuyển động:</Text>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text.primary,
          }}>
            {motion ? 'CÓ' : 'Không'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

// Styles đã được chuyển sang inline styles với theme

export default SensorCard;
