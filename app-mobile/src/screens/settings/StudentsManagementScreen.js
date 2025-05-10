import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '../../config/firebase';

const StudentsManagementScreen = ({ navigation }) => {
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
      info: '#2196F3',
    }
  };
  const { showNotificationBanner } = useNotifications();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    rfidId: '',
    name: '',
    studentId: '',
    class: '',
    major: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsRef = ref(db, 'students');
      const snapshot = await get(studentsRef);
      
      if (snapshot.exists()) {
        const studentsData = snapshot.val();
        const studentsArray = Object.keys(studentsData).map(key => ({
          rfidId: key,
          ...studentsData[key]
        }));
        
        // Sắp xếp theo tên
        studentsArray.sort((a, b) => a.name.localeCompare(b.name));
        
        setStudents(studentsArray);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      showNotificationBanner('Lỗi khi tải danh sách sinh viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      rfidId: '',
      name: '',
      studentId: '',
      class: '',
      major: ''
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      rfidId: student.rfidId,
      name: student.name,
      studentId: student.studentId,
      class: student.class,
      major: student.major
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleDeleteStudent = (student) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa sinh viên "${student.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(db, `students/${student.rfidId}`));
              showNotificationBanner('Đã xóa sinh viên thành công', 'success');
              loadStudents();
            } catch (error) {
              console.error('Error deleting student:', error);
              showNotificationBanner('Lỗi khi xóa sinh viên', 'error');
            }
          }
        }
      ]
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!studentForm.rfidId.trim()) {
      errors.rfidId = 'Mã RFID không được để trống';
    }
    
    if (!studentForm.name.trim()) {
      errors.name = 'Tên sinh viên không được để trống';
    }
    
    if (!studentForm.studentId.trim()) {
      errors.studentId = 'Mã sinh viên không được để trống';
    }
    
    if (!studentForm.class.trim()) {
      errors.class = 'Lớp không được để trống';
    }
    
    if (!studentForm.major.trim()) {
      errors.major = 'Ngành không được để trống';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Kiểm tra xem RFID đã tồn tại chưa (khi thêm mới)
      if (!editingStudent) {
        const studentRef = ref(db, `students/${studentForm.rfidId}`);
        const snapshot = await get(studentRef);
        
        if (snapshot.exists()) {
          setFormErrors({
            ...formErrors,
            rfidId: 'Mã RFID đã tồn tại'
          });
          setSaving(false);
          return;
        }
      }
      
      const studentData = {
        name: studentForm.name,
        studentId: studentForm.studentId,
        class: studentForm.class,
        major: studentForm.major,
        updatedAt: Date.now()
      };
      
      // Nếu là sinh viên mới, thêm createdAt
      if (!editingStudent) {
        studentData.createdAt = Date.now();
      }
      
      await set(ref(db, `students/${studentForm.rfidId}`), studentData);
      
      showNotificationBanner(
        editingStudent ? 'Đã cập nhật sinh viên thành công' : 'Đã thêm sinh viên thành công',
        'success'
      );
      
      setModalVisible(false);
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      showNotificationBanner('Lỗi khi lưu thông tin sinh viên', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.rfidId.toLowerCase().includes(query) ||
      student.class.toLowerCase().includes(query) ||
      student.major.toLowerCase().includes(query)
    );
  });

  const renderStudentItem = ({ item }) => (
    <View style={[styles.studentItem, { backgroundColor: theme.colors.card }]}>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.studentDetail, { color: theme.colors.text }]}>MSSV: {item.studentId}</Text>
        <Text style={[styles.studentDetail, { color: theme.colors.text }]}>Lớp: {item.class}</Text>
        <Text style={[styles.studentDetail, { color: theme.colors.text }]}>Ngành: {item.major}</Text>
        <Text style={[styles.studentDetail, { color: theme.colors.text }]}>RFID: {item.rfidId}</Text>
      </View>
      <View style={styles.studentActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleEditStudent(item)}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error, marginTop: 8 }]}
          onPress={() => handleDeleteStudent(item)}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          Quản lý sinh viên
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddStudent}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Tìm kiếm sinh viên..."
          placeholderTextColor={theme.colors.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Đang tải danh sách sinh viên...
          </Text>
        </View>
      ) : filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={item => item.rfidId}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={64} color={theme.colors.text + '40'} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {searchQuery ? 'Không tìm thấy sinh viên phù hợp' : 'Chưa có sinh viên nào'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddStudent}
            >
              <Text style={styles.emptyButtonText}>Thêm sinh viên</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal thêm/sửa sinh viên */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingStudent ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên mới'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Mã RFID</Text>
              <TextInput
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: formErrors.rfidId ? theme.colors.error : theme.colors.border },
                ]}
                value={studentForm.rfidId}
                onChangeText={(text) => setStudentForm({ ...studentForm, rfidId: text })}
                placeholder="Nhập mã RFID"
                placeholderTextColor={theme.colors.text + '80'}
                editable={!editingStudent} // Không cho phép sửa RFID khi đang sửa
              />
              {formErrors.rfidId && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {formErrors.rfidId}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Tên sinh viên</Text>
              <TextInput
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: formErrors.name ? theme.colors.error : theme.colors.border },
                ]}
                value={studentForm.name}
                onChangeText={(text) => setStudentForm({ ...studentForm, name: text })}
                placeholder="Nhập tên sinh viên"
                placeholderTextColor={theme.colors.text + '80'}
              />
              {formErrors.name && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {formErrors.name}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Mã sinh viên</Text>
              <TextInput
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: formErrors.studentId ? theme.colors.error : theme.colors.border },
                ]}
                value={studentForm.studentId}
                onChangeText={(text) => setStudentForm({ ...studentForm, studentId: text })}
                placeholder="Nhập mã sinh viên"
                placeholderTextColor={theme.colors.text + '80'}
              />
              {formErrors.studentId && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {formErrors.studentId}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Lớp</Text>
              <TextInput
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: formErrors.class ? theme.colors.error : theme.colors.border },
                ]}
                value={studentForm.class}
                onChangeText={(text) => setStudentForm({ ...studentForm, class: text })}
                placeholder="Nhập lớp"
                placeholderTextColor={theme.colors.text + '80'}
              />
              {formErrors.class && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {formErrors.class}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Ngành</Text>
              <TextInput
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: formErrors.major ? theme.colors.error : theme.colors.border },
                ]}
                value={studentForm.major}
                onChangeText={(text) => setStudentForm({ ...studentForm, major: text })}
                placeholder="Nhập ngành"
                placeholderTextColor={theme.colors.text + '80'}
              />
              {formErrors.major && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {formErrors.major}
                </Text>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: saving ? 0.7 : 1,
                  },
                ]}
                onPress={handleSaveStudent}
                disabled={saving}
              >
                <Text style={styles.modalButtonTextSave}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
    padding: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 8,
  },
  studentItem: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentActions: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  modalButtonText: {
    fontWeight: 'bold',
  },
  modalButtonTextSave: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StudentsManagementScreen;
