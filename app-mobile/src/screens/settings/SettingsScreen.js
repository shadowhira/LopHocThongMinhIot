import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { ref, get, update } from 'firebase/database';
import { db } from '../../config/firebase';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../../utils/notificationUtils';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
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
      info: '#2196F3',
    }
  };
  const isDarkMode = themeContext?.isDarkMode || false;
  const toggleTheme = themeContext?.toggleTheme || (() => {});
  const { showNotificationBanner } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [thresholds, setThresholds] = useState({
    temperature: {
      min: 18,
      max: 30,
    },
    humidity: {
      min: 40,
      max: 80,
    },
    gas: 1000,
  });
  const [attendanceTime, setAttendanceTime] = useState({
    checkInHour: 7,
    checkInMinute: 0,
    checkOutHour: 11,
    checkOutMinute: 0,
  });
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [editingTime, setEditingTime] = useState(null);
  const [tempThresholdValue, setTempThresholdValue] = useState('');
  const [tempTimeValue, setTempTimeValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Đọc cài đặt thông báo
        const notificationsRef = ref(db, 'settings/notifications/enabled');
        const notificationsSnapshot = await get(notificationsRef);
        if (notificationsSnapshot.exists()) {
          setNotificationsEnabled(notificationsSnapshot.val());
        }

        // Đọc ngưỡng cảnh báo
        const thresholdsRef = ref(db, 'settings/thresholds');
        const thresholdsSnapshot = await get(thresholdsRef);
        if (thresholdsSnapshot.exists()) {
          setThresholds(thresholdsSnapshot.val());
        }

        // Đọc cài đặt thời gian điểm danh
        const attendanceTimeRef = ref(db, 'settings/attendance');
        const attendanceTimeSnapshot = await get(attendanceTimeRef);
        if (attendanceTimeSnapshot.exists()) {
          setAttendanceTime(attendanceTimeSnapshot.val());
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await update(ref(db, 'settings/notifications'), {
        enabled: value
      });

      if (value) {
        // Yêu cầu quyền thông báo nếu bật
        const token = await registerForPushNotificationsAsync();
        if (!token) {
          Alert.alert(
            'Thông báo',
            'Bạn cần cấp quyền thông báo để nhận cảnh báo!',
            [{ text: 'OK' }]
          );
          setNotificationsEnabled(false);
          await update(ref(db, 'settings/notifications'), {
            enabled: false
          });
        } else {
          showNotificationBanner('Đã bật thông báo cảnh báo', 'success');
        }
      } else {
        showNotificationBanner('Đã tắt thông báo cảnh báo', 'info');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      showNotificationBanner('Lỗi khi cập nhật cài đặt thông báo', 'error');
    }
  };

  const testNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Thông báo thử nghiệm',
          body: 'Đây là thông báo thử nghiệm từ ứng dụng Lớp học thông minh',
          data: { type: 'info' },
        },
        trigger: null, // Hiển thị ngay lập tức
      });
      showNotificationBanner('Đã gửi thông báo thử nghiệm', 'info');
    } catch (error) {
      console.error('Error sending test notification:', error);
      showNotificationBanner('Lỗi khi gửi thông báo thử nghiệm', 'error');
    }
  };

  // Mở modal chỉnh sửa ngưỡng
  const openThresholdEditor = (type, subType = null) => {
    let currentValue;

    if (subType) {
      currentValue = thresholds[type][subType];
    } else {
      currentValue = thresholds[type];
    }

    setEditingThreshold({ type, subType });
    setTempThresholdValue(currentValue.toString());
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa thời gian điểm danh
  const openTimeEditor = (timeType) => {
    let currentValue;

    if (timeType === 'checkInHour') {
      currentValue = attendanceTime.checkInHour;
    } else if (timeType === 'checkInMinute') {
      currentValue = attendanceTime.checkInMinute;
    } else if (timeType === 'checkOutHour') {
      currentValue = attendanceTime.checkOutHour;
    } else if (timeType === 'checkOutMinute') {
      currentValue = attendanceTime.checkOutMinute;
    }

    setEditingTime(timeType);
    setTempTimeValue(currentValue.toString());
    setTimeModalVisible(true);
  };

  // Lưu ngưỡng mới
  const saveThreshold = async () => {
    try {
      setUpdating(true);

      // Kiểm tra giá trị hợp lệ
      const numValue = parseFloat(tempThresholdValue);
      if (isNaN(numValue)) {
        showNotificationBanner('Giá trị không hợp lệ', 'error');
        return;
      }

      // Tạo bản sao của thresholds hiện tại
      const updatedThresholds = { ...thresholds };

      // Cập nhật giá trị
      if (editingThreshold.subType) {
        updatedThresholds[editingThreshold.type][editingThreshold.subType] = numValue;
      } else {
        updatedThresholds[editingThreshold.type] = numValue;
      }

      // Kiểm tra ràng buộc giữa min và max
      if (editingThreshold.subType === 'min' &&
          numValue >= updatedThresholds[editingThreshold.type].max) {
        showNotificationBanner('Giá trị tối thiểu phải nhỏ hơn giá trị tối đa', 'error');
        setUpdating(false);
        return;
      }

      if (editingThreshold.subType === 'max' &&
          numValue <= updatedThresholds[editingThreshold.type].min) {
        showNotificationBanner('Giá trị tối đa phải lớn hơn giá trị tối thiểu', 'error');
        setUpdating(false);
        return;
      }

      // Cập nhật lên Firebase
      await update(ref(db, 'settings/thresholds'), updatedThresholds);

      // Cập nhật state
      setThresholds(updatedThresholds);
      showNotificationBanner('Đã cập nhật ngưỡng cảnh báo', 'success');

      // Đóng modal
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating threshold:', error);
      showNotificationBanner('Lỗi khi cập nhật ngưỡng cảnh báo', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Lưu thời gian điểm danh mới
  const saveAttendanceTime = async () => {
    try {
      setUpdating(true);

      // Kiểm tra giá trị hợp lệ
      const numValue = parseInt(tempTimeValue);
      if (isNaN(numValue)) {
        showNotificationBanner('Giá trị không hợp lệ', 'error');
        return;
      }

      // Tạo bản sao của attendanceTime hiện tại
      const updatedAttendanceTime = { ...attendanceTime };

      // Kiểm tra giá trị hợp lệ dựa trên loại thời gian
      if (editingTime === 'checkInHour' || editingTime === 'checkOutHour') {
        // Giờ phải từ 0-23
        if (numValue < 0 || numValue > 23) {
          showNotificationBanner('Giờ phải từ 0 đến 23', 'error');
          setUpdating(false);
          return;
        }
      } else if (editingTime === 'checkInMinute' || editingTime === 'checkOutMinute') {
        // Phút phải từ 0-59
        if (numValue < 0 || numValue > 59) {
          showNotificationBanner('Phút phải từ 0 đến 59', 'error');
          setUpdating(false);
          return;
        }
      }

      // Cập nhật giá trị
      updatedAttendanceTime[editingTime] = numValue;

      // Kiểm tra ràng buộc giữa giờ vào và giờ ra
      const checkInTime = updatedAttendanceTime.checkInHour * 60 + updatedAttendanceTime.checkInMinute;
      const checkOutTime = updatedAttendanceTime.checkOutHour * 60 + updatedAttendanceTime.checkOutMinute;

      if (checkInTime >= checkOutTime) {
        showNotificationBanner('Giờ ra phải sau giờ vào', 'error');
        setUpdating(false);
        return;
      }

      // Cập nhật lên Firebase
      await update(ref(db, 'settings/attendance'), updatedAttendanceTime);

      // Cập nhật state
      setAttendanceTime(updatedAttendanceTime);
      showNotificationBanner('Đã cập nhật thời gian điểm danh', 'success');

      // Đóng modal
      setTimeModalVisible(false);
    } catch (error) {
      console.error('Error updating attendance time:', error);
      showNotificationBanner('Lỗi khi cập nhật thời gian điểm danh', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          Cài đặt
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Giao diện
            </Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Chế độ tối
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#f4f3f4"
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Thông báo
            </Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Bật thông báo
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#f4f3f4"
              />
            </View>

            {notificationsEnabled && (
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
                onPress={testNotification}
              >
                <Text style={styles.testButtonText}>Gửi thông báo thử nghiệm</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Ngưỡng cảnh báo
            </Text>
            <View style={styles.thresholdContainer}>
              <Text style={[styles.thresholdTitle, { color: theme.colors.text }]}>
                Nhiệt độ
              </Text>
              <View style={styles.thresholdValues}>
                <TouchableOpacity
                  style={styles.thresholdValueContainer}
                  onPress={() => openThresholdEditor('temperature', 'min')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Tối thiểu: {thresholds.temperature.min}°C
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.thresholdValueContainer}
                  onPress={() => openThresholdEditor('temperature', 'max')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Tối đa: {thresholds.temperature.max}°C
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.thresholdContainer}>
              <Text style={[styles.thresholdTitle, { color: theme.colors.text }]}>
                Độ ẩm
              </Text>
              <View style={styles.thresholdValues}>
                <TouchableOpacity
                  style={styles.thresholdValueContainer}
                  onPress={() => openThresholdEditor('humidity', 'min')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Tối thiểu: {thresholds.humidity.min}%
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.thresholdValueContainer}
                  onPress={() => openThresholdEditor('humidity', 'max')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Tối đa: {thresholds.humidity.max}%
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.thresholdContainer}>
              <Text style={[styles.thresholdTitle, { color: theme.colors.text }]}>
                Nồng độ khí gas
              </Text>
              <TouchableOpacity
                style={styles.thresholdValueContainer}
                onPress={() => openThresholdEditor('gas')}
              >
                <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                  Ngưỡng: {thresholds.gas} ppm
                </Text>
                <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Thời gian điểm danh
            </Text>
            <View style={styles.thresholdContainer}>
              <Text style={[styles.thresholdTitle, { color: theme.colors.text }]}>
                Giờ vào
              </Text>
              <View style={styles.timeContainer}>
                <TouchableOpacity
                  style={styles.timeValueContainer}
                  onPress={() => openTimeEditor('checkInHour')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Giờ: {attendanceTime.checkInHour}
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeValueContainer}
                  onPress={() => openTimeEditor('checkInMinute')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Phút: {attendanceTime.checkInMinute}
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.thresholdContainer}>
              <Text style={[styles.thresholdTitle, { color: theme.colors.text }]}>
                Giờ ra
              </Text>
              <View style={styles.timeContainer}>
                <TouchableOpacity
                  style={styles.timeValueContainer}
                  onPress={() => openTimeEditor('checkOutHour')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Giờ: {attendanceTime.checkOutHour}
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeValueContainer}
                  onPress={() => openTimeEditor('checkOutMinute')}
                >
                  <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                    Phút: {attendanceTime.checkOutMinute}
                  </Text>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.infoText, { color: theme.colors.text, marginTop: 8, fontStyle: 'italic' }]}>
              * Thời gian trước giờ ra sẽ được tính là điểm danh vào
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text, fontStyle: 'italic' }]}>
              * Thời gian sau giờ ra sẽ được tính là điểm danh ra
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Quản lý dữ liệu
            </Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('StudentsManagement')}
            >
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Quản lý danh sách sinh viên
              </Text>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Thông tin ứng dụng
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              Lớp học thông minh v1.0.0
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              Đồ án tốt nghiệp - Nhóm 25
            </Text>
          </View>
        </>
      )}

      {/* Modal chỉnh sửa ngưỡng */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Điều chỉnh ngưỡng cảnh báo
            </Text>

            <Text style={[styles.modalLabel, { color: theme.colors.text }]}>
              {editingThreshold?.type === 'temperature' && 'Nhiệt độ'}
              {editingThreshold?.type === 'humidity' && 'Độ ẩm'}
              {editingThreshold?.type === 'gas' && 'Nồng độ khí gas'}
              {editingThreshold?.subType === 'min' && ' tối thiểu'}
              {editingThreshold?.subType === 'max' && ' tối đa'}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, {
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={tempThresholdValue}
                onChangeText={setTempThresholdValue}
                keyboardType="numeric"
                placeholder="Nhập giá trị"
                placeholderTextColor={theme.colors.text + '80'}
              />
              <Text style={[styles.unitText, { color: theme.colors.text }]}>
                {editingThreshold?.type === 'temperature' && '°C'}
                {editingThreshold?.type === 'humidity' && '%'}
                {editingThreshold?.type === 'gas' && 'ppm'}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={() => setModalVisible(false)}
                disabled={updating}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, {
                  backgroundColor: theme.colors.primary,
                  opacity: updating ? 0.7 : 1
                }]}
                onPress={saveThreshold}
                disabled={updating}
              >
                <Text style={styles.modalButtonTextSave}>
                  {updating ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal chỉnh sửa thời gian điểm danh */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={timeModalVisible}
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Điều chỉnh thời gian điểm danh
            </Text>

            <Text style={[styles.modalLabel, { color: theme.colors.text }]}>
              {editingTime === 'checkInHour' && 'Giờ vào (giờ)'}
              {editingTime === 'checkInMinute' && 'Giờ vào (phút)'}
              {editingTime === 'checkOutHour' && 'Giờ ra (giờ)'}
              {editingTime === 'checkOutMinute' && 'Giờ ra (phút)'}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, {
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={tempTimeValue}
                onChangeText={setTempTimeValue}
                keyboardType="numeric"
                placeholder="Nhập giá trị"
                placeholderTextColor={theme.colors.text + '80'}
              />
              {(editingTime === 'checkInHour' || editingTime === 'checkOutHour') && (
                <Text style={[styles.unitText, { color: theme.colors.text }]}>giờ</Text>
              )}
              {(editingTime === 'checkInMinute' || editingTime === 'checkOutMinute') && (
                <Text style={[styles.unitText, { color: theme.colors.text }]}>phút</Text>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={() => setTimeModalVisible(false)}
                disabled={updating}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, {
                  backgroundColor: theme.colors.primary,
                  opacity: updating ? 0.7 : 1
                }]}
                onPress={saveAttendanceTime}
                disabled={updating}
              >
                <Text style={styles.modalButtonTextSave}>
                  {updating ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
  },
  section: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
  },
  thresholdContainer: {
    marginBottom: 16,
  },
  thresholdTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  thresholdValues: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  thresholdValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeValueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  thresholdText: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  testButton: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
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
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  unitText: {
    fontSize: 16,
    width: 40,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default SettingsScreen;
