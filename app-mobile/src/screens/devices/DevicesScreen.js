import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';

const DevicesScreen = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FFC107',
    }
  };

  const [devices, setDevices] = useState({
    lights: {
      light1: false
    },
    doors: {
      door1: false
    },
    status: {
      light1: false,
      door1: false
    },
    auto: {
      light: false,
      door: false
    },
    motion: {
      detected: false,
      lastDetected: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({
    light1: false,
    door1: false,
    autoLight: false,
    autoDoor: false
  });

  useEffect(() => {
    // Đọc trạng thái thiết bị từ Firebase
    const devicesRef = ref(db, 'devices');
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        setDevices(snapshot.val() || {});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Hàm điều khiển đèn
  const toggleLight = async (lightId) => {
    try {
      setUpdating(prev => ({ ...prev, [lightId]: true }));
      const currentValue = devices.lights?.[lightId] || false;
      await update(ref(db, `devices/lights`), {
        [lightId]: !currentValue
      });
    } catch (error) {
      console.error('Error toggling light:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [lightId]: false }));
    }
  };

  // Hàm điều khiển cửa
  const toggleDoor = async (doorId) => {
    try {
      setUpdating(prev => ({ ...prev, [doorId]: true }));
      const currentValue = devices.doors?.[doorId] || false;
      await update(ref(db, `devices/doors`), {
        [doorId]: !currentValue
      });
    } catch (error) {
      console.error('Error toggling door:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [doorId]: false }));
    }
  };

  // Hàm bật/tắt chế độ tự động cho đèn
  const toggleAutoLight = async () => {
    try {
      setUpdating(prev => ({ ...prev, autoLight: true }));
      const currentValue = devices.auto?.light || false;
      await update(ref(db, `devices/auto`), {
        light: !currentValue
      });
    } catch (error) {
      console.error('Error toggling auto light mode:', error);
    } finally {
      setUpdating(prev => ({ ...prev, autoLight: false }));
    }
  };

  // Hàm bật/tắt chế độ tự động cho cửa
  const toggleAutoDoor = async () => {
    try {
      setUpdating(prev => ({ ...prev, autoDoor: true }));
      const currentValue = devices.auto?.door || false;
      await update(ref(db, `devices/auto`), {
        door: !currentValue
      });
    } catch (error) {
      console.error('Error toggling auto door mode:', error);
    } finally {
      setUpdating(prev => ({ ...prev, autoDoor: false }));
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Điều khiển thiết bị</Text>

      {/* Điều khiển đèn */}
      <View style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Đèn</Text>

        {/* Chế độ tự động cho đèn */}
        <View style={[styles.deviceItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name="flash"
              size={24}
              color={devices.auto?.light ? theme.colors.warning : theme.colors.text}
            />
            <Text style={[styles.deviceName, { color: theme.colors.text }]}>Chế độ tự động</Text>
          </View>
          <View style={styles.controlContainer}>
            <Text style={[styles.statusText, {
              color: devices.auto?.light ? theme.colors.success : theme.colors.text
            }]}>
              {devices.auto?.light ? 'BẬT' : 'TẮT'}
            </Text>
            {updating.autoLight ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.activityIndicator} />
            ) : (
              <Switch
                value={devices.auto?.light || false}
                onValueChange={toggleAutoLight}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={devices.auto?.light ? '#f5dd4b' : '#f4f3f4'}
              />
            )}
          </View>
        </View>

        {/* Điều khiển thủ công đèn (chỉ hiển thị khi chế độ tự động tắt) */}
        {!devices.auto?.light && (
          <View style={[styles.deviceItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.deviceInfo}>
              <Ionicons
                name={devices.status?.light1 ? "bulb" : "bulb-outline"}
                size={24}
                color={devices.status?.light1 ? theme.colors.warning : theme.colors.text}
              />
              <Text style={[styles.deviceName, { color: theme.colors.text }]}>Đèn</Text>
            </View>
            <View style={styles.controlContainer}>
              <Text style={[styles.statusText, {
                color: devices.status?.light1 ? theme.colors.success : theme.colors.text
              }]}>
                {devices.status?.light1 ? 'BẬT' : 'TẮT'}
              </Text>
              {updating.light1 ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={styles.activityIndicator} />
              ) : (
                <Switch
                  value={devices.lights?.light1 || false}
                  onValueChange={() => toggleLight('light1')}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                  thumbColor={devices.lights?.light1 ? '#f5dd4b' : '#f4f3f4'}
                />
              )}
            </View>
          </View>
        )}

        {/* Hiển thị trạng thái cảm biến chuyển động khi chế độ tự động bật */}
        {devices.auto?.light && (
          <View style={[styles.deviceItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.deviceInfo}>
              <Ionicons
                name={devices.motion?.detected ? "body" : "body-outline"}
                size={24}
                color={devices.motion?.detected ? theme.colors.warning : theme.colors.text}
              />
              <Text style={[styles.deviceName, { color: theme.colors.text }]}>Phát hiện chuyển động</Text>
            </View>
            <Text style={[styles.statusText, {
              color: devices.motion?.detected ? theme.colors.success : theme.colors.text
            }]}>
              {devices.motion?.detected ? 'CÓ' : 'KHÔNG'}
            </Text>
          </View>
        )}
      </View>

      {/* Điều khiển cửa */}
      <View style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cửa</Text>

        {/* Chế độ tự động cho cửa */}
        <View style={[styles.deviceItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name="flash"
              size={24}
              color={devices.auto?.door ? theme.colors.warning : theme.colors.text}
            />
            <Text style={[styles.deviceName, { color: theme.colors.text }]}>Chế độ tự động</Text>
          </View>
          <View style={styles.controlContainer}>
            <Text style={[styles.statusText, {
              color: devices.auto?.door ? theme.colors.success : theme.colors.text
            }]}>
              {devices.auto?.door ? 'BẬT' : 'TẮT'}
            </Text>
            {updating.autoDoor ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.activityIndicator} />
            ) : (
              <Switch
                value={devices.auto?.door || false}
                onValueChange={toggleAutoDoor}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={devices.auto?.door ? '#f5dd4b' : '#f4f3f4'}
              />
            )}
          </View>
        </View>

        {/* Điều khiển thủ công cửa (chỉ hiển thị khi chế độ tự động tắt) */}
        {!devices.auto?.door && (
          <View style={[styles.deviceItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.deviceInfo}>
              <Ionicons
                name={devices.status?.door1 ? "lock-open" : "lock-closed"}
                size={24}
                color={devices.status?.door1 ? theme.colors.success : theme.colors.text}
              />
              <Text style={[styles.deviceName, { color: theme.colors.text }]}>Cửa</Text>
            </View>
            <View style={styles.controlContainer}>
              <Text style={[styles.statusText, {
                color: devices.status?.door1 ? theme.colors.success : theme.colors.text
              }]}>
                {devices.status?.door1 ? 'MỞ' : 'ĐÓNG'}
              </Text>
              {updating.door1 ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={styles.activityIndicator} />
              ) : (
                <Switch
                  value={devices.doors?.door1 || false}
                  onValueChange={() => toggleDoor('door1')}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                  thumbColor={devices.doors?.door1 ? '#f5dd4b' : '#f4f3f4'}
                />
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          * Trạng thái hiển thị là trạng thái thực tế của thiết bị
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.text, marginTop: 8 }]}>
          * Chế độ tự động đèn: Tự động bật khi phát hiện chuyển động và tắt sau 10 giây
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.text, marginTop: 4 }]}>
          * Chế độ tự động cửa: Tự động mở khi quẹt thẻ RFID và đóng sau 10 giây
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    marginLeft: 12,
  },
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginRight: 12,
    fontWeight: 'bold',
  },
  activityIndicator: {
    marginHorizontal: 10,
  },
  infoContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  infoText: {
    fontStyle: 'italic',
    fontSize: 12,
  },
});

export default DevicesScreen;
