import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AttendanceRecord } from '../types';

interface AttendanceListProps {
  records: AttendanceRecord[];
  date: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ records, date }) => {
  // Định dạng ngày hiển thị (từ YYYYMMDD sang DD/MM/YYYY)
  const formattedDate = `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(0, 4)}`;
  
  // Hàm render item
  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    // Xác định màu sắc trạng thái
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'present': return '#4CAF50';
        case 'absent': return '#F44336';
        case 'late': return '#FF9800';
        default: return '#757575';
      }
    };
    
    // Xác định icon trạng thái
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'present': return 'check-circle';
        case 'absent': return 'close-circle';
        case 'late': return 'clock-alert';
        default: return 'help-circle';
      }
    };
    
    // Xác định text trạng thái
    const getStatusText = (status: string) => {
      switch (status) {
        case 'present': return 'Có mặt';
        case 'absent': return 'Vắng mặt';
        case 'late': return 'Đi trễ';
        default: return 'Không xác định';
      }
    };
    
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const statusText = getStatusText(item.status);
    
    return (
      <View style={styles.itemContainer}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.rfidId}>RFID: {item.rfidId}</Text>
        </View>
        
        <View style={styles.attendanceInfo}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Vào:</Text>
            <Text style={styles.timeValue}>{item.timeIn || '---'}</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Ra:</Text>
            <Text style={styles.timeValue}>{item.timeOut || '---'}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name={statusIcon} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
      </View>
    );
  };
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Điểm danh ngày {formattedDate}</Title>
        
        {records.length === 0 ? (
          <Text style={styles.emptyText}>Không có dữ liệu điểm danh</Text>
        ) : (
          <FlatList
            data={records}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
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
  itemContainer: {
    marginBottom: 10,
  },
  studentInfo: {
    marginBottom: 5,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rfidId: {
    fontSize: 12,
    color: '#757575',
  },
  attendanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  timeContainer: {
    flexDirection: 'row',
  },
  timeLabel: {
    fontSize: 14,
    marginRight: 5,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  divider: {
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#757575',
  },
});

export default AttendanceList;
