import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AttendanceRecord } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface AttendanceListProps {
  records: AttendanceRecord[];
  date: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ records, date }) => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

  // Định dạng ngày hiển thị (từ YYYYMMDD sang DD/MM/YYYY)
  const formattedDate = `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(0, 4)}`;

  // Hàm render item
  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    // Xác định màu sắc trạng thái
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'present': return theme.success;
        case 'absent': return theme.error;
        case 'late': return theme.warning;
        default: return theme.text.disabled;
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
      <View style={{
        marginBottom: 10,
      }}>
        <View style={{
          marginBottom: 5,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text.primary,
          }}>{item.studentName}</Text>
          <Text style={{
            fontSize: 12,
            color: theme.text.secondary,
          }}>RFID: {item.rfidId}</Text>
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 5,
        }}>
          <View style={{
            flexDirection: 'row',
          }}>
            <Text style={{
              fontSize: 14,
              marginRight: 5,
              color: theme.text.primary,
            }}>Vào:</Text>
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: theme.text.primary,
            }}>{item.timeIn || '---'}</Text>
          </View>

          <View style={{
            flexDirection: 'row',
          }}>
            <Text style={{
              fontSize: 14,
              marginRight: 5,
              color: theme.text.primary,
            }}>Ra:</Text>
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: theme.text.primary,
            }}>{item.timeOut || '---'}</Text>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name={statusIcon} size={16} color={statusColor} />
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginLeft: 5,
              color: statusColor,
            }}>{statusText}</Text>
          </View>
        </View>

        <Divider style={{
          marginTop: 10,
          backgroundColor: theme.border,
        }} />
      </View>
    );
  };

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
          marginBottom: 15,
          color: theme.text.primary,
        }}>Điểm danh ngày {formattedDate}</Title>

        {records.length === 0 ? (
          <Text style={{
            textAlign: 'center',
            marginVertical: 20,
            color: theme.text.secondary,
          }}>Không có dữ liệu điểm danh</Text>
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

// Styles đã được chuyển sang inline styles với theme

export default AttendanceList;
