import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Modal } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../../config/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const AttendanceScreen = () => {
  // Sử dụng giá trị mặc định cho theme để tránh lỗi
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
    }
  };
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0
  });

  // Hàm chuyển đổi Date thành chuỗi định dạng YYYYMMDD
  const formatDateToString = (date) => {
    return date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
  };

  // Hàm định dạng ngày hiển thị
  const formatDateDisplay = (date) => {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  };

  useEffect(() => {
    // Sử dụng ngày được chọn
    setLoading(true);
    const dateString = formatDateToString(selectedDate);

    // Lắng nghe thay đổi dữ liệu điểm danh
    const attendanceRef = ref(db, `attendance/${dateString}`);
    const unsubscribe = onValue(attendanceRef, async (snapshot) => {
      if (snapshot.exists()) {
        const attendanceData = snapshot.val();

        // Chuyển đổi từ object sang array và lấy thông tin sinh viên
        const records = [];

        // Lấy tất cả thông tin sinh viên một lần
        const studentsRef = ref(db, 'students');
        const studentsSnapshot = await get(studentsRef);
        const studentsData = studentsSnapshot.exists() ? studentsSnapshot.val() : {};
        const totalStudents = studentsSnapshot.exists() ? Object.keys(studentsData).length : 0;

        // Tạo danh sách điểm danh với thông tin sinh viên
        for (const key of Object.keys(attendanceData)) {
          const studentName = studentsData[key]?.name || 'Không xác định';

          records.push({
            id: key,
            rfidId: key,
            studentName: studentName,
            timeIn: attendanceData[key].in || null,
            timeOut: attendanceData[key].out || null,
            status: attendanceData[key].status || 'absent'
          });
        }

        setAttendanceRecords(records);

        // Tính toán thống kê
        const presentCount = records.filter(record => record.status === 'present').length;
        const lateCount = records.filter(record => record.status === 'late').length;

        // Cập nhật thống kê
        setStats({
          totalStudents,
          presentToday: presentCount,
          lateToday: lateCount,
          absentToday: totalStudents - presentCount - lateCount
        });
      } else {
        setAttendanceRecords([]);

        // Lấy tổng số sinh viên
        const studentsRef = ref(db, 'students');
        const studentsSnapshot = await get(studentsRef);
        const totalStudents = studentsSnapshot.exists() ? Object.keys(studentsSnapshot.val()).length : 0;

        setStats({
          totalStudents,
          presentToday: 0,
          lateToday: 0,
          absentToday: totalStudents
        });
      }

      setLoading(false);
    }, (error) => {
      console.error('Error reading attendance data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]); // Thêm selectedDate vào dependency để cập nhật khi ngày thay đổi

  // Xử lý khi thay đổi ngày
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // Chuyển đến ngày hôm trước
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  // Chuyển đến ngày hôm sau
  const goToNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Có mặt';
      case 'late':
        return 'Đi trễ';
      case 'absent':
        return 'Vắng mặt';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return theme.colors.success;
      case 'late':
        return theme.colors.warning;
      case 'absent':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={[styles.attendanceCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.attendanceHeader}>
        <Text style={[styles.studentName, { color: theme.colors.text }]}>
          {item.studentName}
        </Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>
      <View style={styles.attendanceDetails}>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeLabel, { color: theme.colors.text }]}>Giờ vào:</Text>
          <Text style={[styles.timeValue, { color: theme.colors.text }]}>{formatTime(item.timeIn)}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeLabel, { color: theme.colors.text }]}>Giờ ra:</Text>
          <Text style={[styles.timeValue, { color: theme.colors.text }]}>{formatTime(item.timeOut)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          Điểm danh
        </Text>
      </View>

      {/* Phần chọn ngày */}
      <View style={[styles.datePickerContainer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.dateNavButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { color: theme.colors.primary }]}>
            {formatDateDisplay(selectedDate)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextDay} style={styles.dateNavButton}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          style={styles.datePicker}
        />
      )}

      <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalStudents}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Tổng số</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.presentToday}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Có mặt</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>{stats.lateToday}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Đi trễ</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>{stats.absentToday}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Vắng mặt</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tải dữ liệu...</Text>
        </View>
      ) : attendanceRecords.length > 0 ? (
        <FlatList
          data={attendanceRecords}
          renderItem={renderAttendanceItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Chưa có dữ liệu điểm danh ngày {formatDateDisplay(selectedDate)}
          </Text>
        </View>
      )}
    </View>
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
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 8,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateSelector: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateNavButton: {
    padding: 8,
  },
  datePicker: {
    width: '100%',
    backgroundColor: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
  },
  listContainer: {
    padding: 8,
  },
  attendanceCard: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  attendanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  timeValue: {
    fontSize: 14,
  },
});

export default AttendanceScreen;
