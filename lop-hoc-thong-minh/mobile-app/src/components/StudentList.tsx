import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Divider, Searchbar } from 'react-native-paper';
import { Student } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface StudentListProps {
  students: Student[];
  onStudentPress?: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onStudentPress }) => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = React.useState('');

  // Lọc sinh viên theo từ khóa tìm kiếm
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.class.toLowerCase().includes(query)
    );
  });

  // Hàm render item
  const renderItem = ({ item }: { item: Student }) => (
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
        }}>{item.name}</Text>
        <Text style={{
          fontSize: 14,
          color: theme.text.primary,
        }}>MSSV: {item.studentId}</Text>
        <Text style={{
          fontSize: 14,
          color: theme.text.primary,
        }}>Lớp: {item.class}</Text>
        <Text style={{
          fontSize: 12,
          color: theme.text.secondary,
        }}>RFID: {item.rfidId}</Text>
      </View>

      <Divider style={{
        marginTop: 10,
        backgroundColor: theme.border,
      }} />
    </View>
  );

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
        }}>Danh sách sinh viên</Title>

        <Searchbar
          placeholder="Tìm kiếm sinh viên..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            marginBottom: 15,
            elevation: 0,
            backgroundColor: theme.isDarkMode ? theme.background : undefined,
          }}
          iconColor={theme.primary}
          inputStyle={{
            color: theme.text.primary,
          }}
        />

        {filteredStudents.length === 0 ? (
          <Text style={{
            textAlign: 'center',
            marginVertical: 20,
            color: theme.text.secondary,
          }}>Không tìm thấy sinh viên</Text>
        ) : (
          <FlatList
            data={filteredStudents}
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

export default StudentList;
