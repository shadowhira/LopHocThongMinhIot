import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSensors, simulateAlertCondition } from '../hooks/useSensors';
import { useDevices } from '../hooks/useDevices';
import { useAttendanceStats } from '../hooks/useAttendance';
import SensorCard from '../components/SensorCard';
import DeviceControl from '../components/DeviceControl';
import AttendanceStats from '../components/AttendanceStats';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../theme/ThemeContext';
import { Button } from 'react-native-paper';
import { useAlerts } from '../context/AlertContext';

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  // Sử dụng theme từ context
  const { theme } = useTheme();

  // Sử dụng alerts context
  const { addAlert } = useAlerts();

  // Lấy dữ liệu cảm biến
  const { sensorData, loading: sensorsLoading, error: sensorsError } = useSensors();

  // Hàm mô phỏng cảnh báo
  const simulateAlert = (type: 'gas' | 'flame' | 'temperature') => {
    const data = simulateAlertCondition(type);

    // Tạo cảnh báo tương ứng
    switch (type) {
      case 'gas':
        addAlert({
          type: 'gas',
          message: 'Nồng độ khí gas nguy hiểm',
          value: data.gas
        });
        break;
      case 'flame':
        addAlert({
          type: 'flame',
          message: 'Phát hiện lửa trong lớp học',
          value: true
        });
        break;
      case 'temperature':
        addAlert({
          type: 'temperature',
          message: 'Nhiệt độ cao bất thường',
          value: data.temperature
        });
        break;
    }
  };

  // Lấy trạng thái thiết bị
  const {
    devices,
    loading: devicesLoading,
    error: devicesError,
    controlDoor,
    controlLight,
    toggleAutoMode
  } = useDevices();

  // Lấy thống kê điểm danh
  const { stats, loading: statsLoading, error: statsError } = useAttendanceStats();

  // Xử lý refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Đợi 1 giây để tạo cảm giác refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Hiển thị loading nếu đang tải dữ liệu
  if (sensorsLoading || devicesLoading || statsLoading) {
    return <LoadingIndicator message="Đang tải dữ liệu..." />;
  }

  // Hiển thị lỗi nếu có
  if (sensorsError || devicesError || statsError) {
    return (
      <ErrorMessage
        message={sensorsError || devicesError || statsError || 'Đã xảy ra lỗi'}
        onRetry={onRefresh}
      />
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16,
        textAlign: 'center',
        color: theme.text.primary,
      }}>Lớp học thông minh</Text>

      {/* Thống kê điểm danh */}
      <AttendanceStats stats={stats} />

      {/* Thông số cảm biến */}
      <SensorCard sensorData={sensorData} />

      {/* Nút mô phỏng cảnh báo - chỉ để kiểm tra */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginVertical: 10
      }}>
        <Button
          mode="contained"
          onPress={() => simulateAlert('gas')}
          style={{ flex: 1, marginRight: 5, backgroundColor: theme.error }}
        >
          Mô phỏng Gas
        </Button>
        <Button
          mode="contained"
          onPress={() => simulateAlert('flame')}
          style={{ flex: 1, marginHorizontal: 5, backgroundColor: theme.flame }}
        >
          Mô phỏng Lửa
        </Button>
        <Button
          mode="contained"
          onPress={() => simulateAlert('temperature')}
          style={{ flex: 1, marginLeft: 5, backgroundColor: theme.warning }}
        >
          Mô phỏng Nhiệt
        </Button>
      </View>

      {/* Điều khiển thiết bị */}
      <DeviceControl
        devices={devices}
        onDoorControl={controlDoor}
        onLightControl={controlLight}
        onAutoModeToggle={toggleAutoMode}
      />
    </ScrollView>
  );
};

// Styles đã được chuyển sang inline styles với theme

export default HomeScreen;
