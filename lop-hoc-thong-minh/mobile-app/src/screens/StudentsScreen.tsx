import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useStudents } from '../hooks/useStudents';
import StudentList from '../components/StudentList';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

const StudentsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Lấy danh sách sinh viên
  const { students, loading, error } = useStudents();
  
  // Xử lý refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Đợi 1 giây để tạo cảm giác refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return <LoadingIndicator message="Đang tải danh sách sinh viên..." />;
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
      <Text style={styles.header}>Danh sách sinh viên</Text>
      
      {/* Thông tin tổng quan */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{students.length}</Text>
          <Text style={styles.statLabel}>Tổng số sinh viên</Text>
        </View>
      </View>
      
      {/* Danh sách sinh viên */}
      <StudentList students={students} />
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    minWidth: 150,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
});

export default StudentsScreen;
