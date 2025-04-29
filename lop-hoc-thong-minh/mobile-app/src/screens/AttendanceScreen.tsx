import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAttendanceByDate } from '../hooks/useAttendance';
import AttendanceList from '../components/AttendanceList';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AttendanceScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Lấy ngày hiện tại theo định dạng YYYYMMDD
  const today = new Date();
  const todayString = today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');
  
  // State để lưu ngày đang xem
  const [currentDate, setCurrentDate] = useState(todayString);
  
  // Lấy dữ liệu điểm danh theo ngày
  const { records, loading, error } = useAttendanceByDate(currentDate);
  
  // Xử lý refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Đợi 1 giây để tạo cảm giác refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  // Chuyển đến ngày hôm trước
  const goToPreviousDay = () => {
    const date = new Date(
      parseInt(currentDate.substring(0, 4)),
      parseInt(currentDate.substring(4, 6)) - 1,
      parseInt(currentDate.substring(6, 8))
    );
    date.setDate(date.getDate() - 1);
    
    const newDateString = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    
    setCurrentDate(newDateString);
  };
  
  // Chuyển đến ngày hôm sau
  const goToNextDay = () => {
    const date = new Date(
      parseInt(currentDate.substring(0, 4)),
      parseInt(currentDate.substring(4, 6)) - 1,
      parseInt(currentDate.substring(6, 8))
    );
    date.setDate(date.getDate() + 1);
    
    // Không cho phép chọn ngày trong tương lai
    if (date > today) {
      return;
    }
    
    const newDateString = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    
    setCurrentDate(newDateString);
  };
  
  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return <LoadingIndicator message="Đang tải dữ liệu điểm danh..." />;
  }
  
  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <ErrorMessage 
        message={error} 
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
      <Text style={styles.header}>Điểm danh sinh viên</Text>
      
      {/* Điều hướng ngày */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={goToPreviousDay}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#2196F3" />
          <Text style={styles.navText}>Hôm trước</Text>
        </TouchableOpacity>
        
        <Text style={styles.currentDate}>
          {`${currentDate.substring(6, 8)}/${currentDate.substring(4, 6)}/${currentDate.substring(0, 4)}`}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.navButton, 
            { opacity: currentDate === todayString ? 0.5 : 1 }
          ]} 
          onPress={goToNextDay}
          disabled={currentDate === todayString}
        >
          <Text style={styles.navText}>Hôm sau</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>
      
      {/* Danh sách điểm danh */}
      <AttendanceList records={records} date={currentDate} />
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
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  currentDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceScreen;
