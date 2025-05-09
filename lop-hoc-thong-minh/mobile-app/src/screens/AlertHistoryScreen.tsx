import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Title, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlerts, Alert } from '../context/AlertContext';
import { useTheme } from '../theme/ThemeContext';

const AlertHistoryScreen: React.FC = () => {
  const { alerts, markAllAsRead, clearAlerts } = useAlerts();
  const { theme } = useTheme();

  console.log('Danh sách cảnh báo:', alerts);

  // Lấy icon và màu sắc dựa vào loại cảnh báo
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'gas':
        return 'gas-cylinder';
      case 'flame':
        return 'fire';
      case 'temperature':
        return 'thermometer';
      case 'motion':
        return 'motion-sensor';
      case 'door':
        return 'door';
      default:
        return 'alert';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'gas':
      case 'flame':
        return theme.error;
      case 'temperature':
        return theme.warning;
      case 'motion':
      case 'door':
        return theme.info;
      default:
        return theme.warning;
    }
  };

  // Định dạng thời gian
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Render item
  const renderItem = ({ item }: { item: Alert }) => (
    <View style={[
      styles.alertItem,
      {
        backgroundColor: item.isRead ? theme.card : theme.card,
        borderLeftColor: getAlertColor(item.type),
      }
    ]}>
      <View style={styles.alertHeader}>
        <MaterialCommunityIcons
          name={getAlertIcon(item.type)}
          size={24}
          color={getAlertColor(item.type)}
        />
        <Text style={[
          styles.alertTitle,
          {
            color: theme.text.primary,
            fontWeight: item.isRead ? 'normal' : 'bold',
          }
        ]}>
          {item.message}
        </Text>
      </View>

      <Text style={[styles.alertTime, { color: theme.text.secondary }]}>
        {formatTime(item.timestamp)}
      </Text>

      {item.value !== undefined && (
        <Text style={[styles.alertValue, { color: theme.text.primary }]}>
          Giá trị: {typeof item.value === 'boolean' ? (item.value ? 'Có' : 'Không') : item.value}
        </Text>
      )}

      <Divider style={[styles.divider, { backgroundColor: theme.border }]} />
    </View>
  );

  // Hàm tạo cảnh báo mẫu để kiểm tra
  const createSampleAlert = () => {
    const alertTypes: Alert['type'][] = ['gas', 'flame', 'temperature', 'motion', 'door'];
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

    const alertMessages = {
      gas: 'Nồng độ khí gas nguy hiểm',
      flame: 'Phát hiện lửa trong lớp học',
      temperature: 'Nhiệt độ cao bất thường',
      motion: 'Phát hiện chuyển động',
      door: 'Cửa đã được mở',
    };

    const alertValues = {
      gas: 350,
      flame: true,
      temperature: 30,
      motion: true,
      door: true,
    };

    useAlerts().addAlert({
      type: randomType,
      message: alertMessages[randomType],
      value: alertValues[randomType],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text.primary }]}>Lịch sử cảnh báo</Text>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={markAllAsRead}
          style={[styles.button, { borderColor: theme.primary }]}
          labelStyle={{ color: theme.primary }}
        >
          Đánh dấu đã đọc
        </Button>

        <Button
          mode="outlined"
          onPress={clearAlerts}
          style={[styles.button, { borderColor: theme.error }]}
          labelStyle={{ color: theme.error }}
        >
          Xóa tất cả
        </Button>
      </View>

      {/* Nút tạo cảnh báo mẫu - chỉ để kiểm tra */}
      {/* <Button
        mode="contained"
        onPress={createSampleAlert}
        style={{ marginTop: 10, backgroundColor: theme.primary }}
      >
        Tạo cảnh báo mẫu
      </Button> */}

      {alerts.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <Card.Content>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
              Không có cảnh báo nào
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  alertItem: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertTitle: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    marginBottom: 5,
  },
  alertValue: {
    fontSize: 14,
  },
  divider: {
    marginTop: 10,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AlertHistoryScreen;
