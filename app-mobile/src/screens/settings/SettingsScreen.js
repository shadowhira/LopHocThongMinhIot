import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { ref, get, update } from 'firebase/database';
import { db } from '../../config/firebase';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../../utils/notificationUtils';

const SettingsScreen = () => {
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
                <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                  Tối thiểu: {thresholds.temperature.min}°C
                </Text>
                <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                  Tối đa: {thresholds.temperature.max}°C
                </Text>
              </View>
            </View>

            <View style={styles.thresholdContainer}>
              <Text style={[styles.thresholdTitle, { color: theme.colors.text }]}>
                Độ ẩm
              </Text>
              <View style={styles.thresholdValues}>
                <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                  Tối thiểu: {thresholds.humidity.min}%
                </Text>
                <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                  Tối đa: {thresholds.humidity.max}%
                </Text>
              </View>
            </View>

            <View style={styles.thresholdContainer}>
              <Text style={[styles.thresholdTitle, { color: theme.colors.text }]}>
                Nồng độ khí gas
              </Text>
              <Text style={[styles.thresholdText, { color: theme.colors.text }]}>
                Ngưỡng: {thresholds.gas} ppm
              </Text>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

export default SettingsScreen;
