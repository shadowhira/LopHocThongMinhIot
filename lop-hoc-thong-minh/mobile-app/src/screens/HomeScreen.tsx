import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSensors } from '../hooks/useSensors';
import { useDevices } from '../hooks/useDevices';
import { useAttendanceStats } from '../hooks/useAttendance';
import SensorCard from '../components/SensorCard';
import DeviceControl from '../components/DeviceControl';
import AttendanceStats from '../components/AttendanceStats';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Lấy dữ liệu cảm biến
  const { sensorData, loading: sensorsLoading, error: sensorsError } = useSensors();
  
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
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Lớp học thông minh</Text>
      
      {/* Thống kê điểm danh */}
      <AttendanceStats stats={stats} />
      
      {/* Thông số cảm biến */}
      <SensorCard sensorData={sensorData} />
      
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
