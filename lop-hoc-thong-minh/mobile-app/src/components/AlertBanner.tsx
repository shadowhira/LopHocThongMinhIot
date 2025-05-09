import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlerts, Alert } from '../context/AlertContext';
import { useTheme } from '../theme/ThemeContext';

const AlertBanner: React.FC = () => {
  const { hasActiveAlert, latestAlert, markAsRead } = useAlerts();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const translateY = new Animated.Value(-100);

  // Hiệu ứng hiển thị/ẩn banner
  useEffect(() => {
    if (hasActiveAlert && latestAlert) {
      console.log('Hiển thị banner cảnh báo:', latestAlert);
      setVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();

      // Tự động ẩn banner sau 5 giây
      const timer = setTimeout(() => {
        hideBanner();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasActiveAlert, latestAlert]);

  // Ẩn banner
  const hideBanner = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  // Xử lý khi nhấn vào banner
  const handlePress = () => {
    if (latestAlert) {
      markAsRead(latestAlert.id);
      hideBanner();
      console.log('Đã đánh dấu cảnh báo đã đọc:', latestAlert.id);
    }
  };

  // Lấy icon và màu sắc dựa vào loại cảnh báo
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'gas':
        return 'gas-cylinder';
      case 'flame':
        return 'fire';
      case 'temperature':
        return 'thermometer';
      case 'motion':
        return 'motion-sensor';
      case 'door':
        return 'door';
      default:
        return 'alert';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'gas':
      case 'flame':
        return theme.error;
      case 'temperature':
        return theme.warning;
      case 'motion':
      case 'door':
        return theme.info;
      default:
        return theme.warning;
    }
  };

  // Định dạng thời gian
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!visible || !latestAlert) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: getAlertColor(latestAlert.type),
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getAlertIcon(latestAlert.type)}
            size={24}
            color={getAlertColor(latestAlert.type)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Cảnh báo: {latestAlert.message}
          </Text>
          <Text style={[styles.time, { color: theme.text.secondary }]}>
            {formatTime(latestAlert.timestamp)}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => markAsRead(latestAlert.id)}>
          <MaterialCommunityIcons name="close" size={20} color={theme.text.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
  },
});

export default AlertBanner;
