import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const HomeScreen = () => {
  // Sử dụng giá trị mặc định cho theme để tránh lỗi
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          Lớp học thông minh
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Chào mừng đến với ứng dụng Lớp học thông minh
        </Text>
        <Text style={[styles.cardContent, { color: theme.colors.text }]}>
          Ứng dụng giúp quản lý và giám sát lớp học thông qua hệ thống cảm biến và điểm danh tự động.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Tính năng chính
        </Text>
        <Text style={[styles.cardContent, { color: theme.colors.text }]}>
          • Điểm danh tự động bằng thẻ RFID{'\n'}
          • Giám sát nhiệt độ, độ ẩm, khí gas{'\n'}
          • Phát hiện lửa và cảnh báo{'\n'}
          • Thống kê điểm danh{'\n'}
          • Thông báo khi có cảnh báo
        </Text>
      </View>
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
  cardContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default HomeScreen;
