import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useStudents } from '../hooks/useStudents';
import StudentList from '../components/StudentList';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../theme/ThemeContext';

const StudentsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  // Sử dụng theme từ context
  const { theme } = useTheme();

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
      }}>Danh sách sinh viên</Text>

      {/* Thông tin tổng quan */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 10,
      }}>
        <View style={{
          alignItems: 'center',
          backgroundColor: theme.card,
          padding: 15,
          borderRadius: 10,
          elevation: 2,
          minWidth: 150,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.primary,
          }}>{students.length}</Text>
          <Text style={{
            fontSize: 14,
            color: theme.text.secondary,
            marginTop: 5,
          }}>Tổng số sinh viên</Text>
        </View>
      </View>

      {/* Danh sách sinh viên */}
      <StudentList students={students} />
    </ScrollView>
  );
};

// Styles đã được chuyển sang inline styles với theme

export default StudentsScreen;
