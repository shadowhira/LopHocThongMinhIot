import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Divider, Searchbar } from 'react-native-paper';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onStudentPress?: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onStudentPress }) => {
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
    <View style={styles.itemContainer}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentId}>MSSV: {item.studentId}</Text>
        <Text style={styles.className}>Lớp: {item.class}</Text>
        <Text style={styles.rfidId}>RFID: {item.rfidId}</Text>
      </View>
      
      <Divider style={styles.divider} />
    </View>
  );
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Danh sách sinh viên</Title>
        
        <Searchbar
          placeholder="Tìm kiếm sinh viên..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        {filteredStudents.length === 0 ? (
          <Text style={styles.emptyText}>Không tìm thấy sinh viên</Text>
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
  searchBar: {
    marginBottom: 15,
    elevation: 0,
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
  studentId: {
    fontSize: 14,
  },
  className: {
    fontSize: 14,
  },
  rfidId: {
    fontSize: 12,
    color: '#757575',
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

export default StudentList;
