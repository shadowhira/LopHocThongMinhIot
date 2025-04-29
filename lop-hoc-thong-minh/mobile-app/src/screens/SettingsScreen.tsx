import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { List, Divider, Switch } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';

const SettingsScreen: React.FC = () => {
  // Sử dụng theme từ context
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // State cho các cài đặt
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  // Xử lý khi nhấn vào liên kết
  const handleLinkPress = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết này');
      }
    });
  };

  return (
    <ScrollView style={{
      flex: 1,
      backgroundColor: theme.background,
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16,
        textAlign: 'center',
        color: theme.text.primary,
      }}>Cài đặt</Text>

      <List.Section>
        <List.Subheader>Giao diện</List.Subheader>

        <List.Item
          title="Chế độ tối"
          description={isDarkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={props => (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.switch.track.inactive, true: theme.switch.track.active }}
              thumbColor={isDarkMode ? theme.switch.thumb.active : theme.switch.thumb.inactive}
            />
          )}
        />

        <Divider />

        <List.Item
          title="Tự động làm mới"
          description="Tự động làm mới dữ liệu mỗi 30 giây"
          left={props => <List.Icon {...props} icon="refresh" />}
          right={props => (
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: theme.switch.track.inactive, true: theme.switch.track.active }}
              thumbColor={autoRefresh ? theme.switch.thumb.active : theme.switch.thumb.inactive}
            />
          )}
        />

        <Divider />

        <List.Subheader>Thông báo</List.Subheader>

        <List.Item
          title="Thông báo"
          description="Nhận thông báo khi có sự kiện quan trọng"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.switch.track.inactive, true: theme.switch.track.active }}
              thumbColor={notificationsEnabled ? theme.switch.thumb.active : theme.switch.thumb.inactive}
            />
          )}
        />

        <Divider />

        <List.Subheader>Thông tin</List.Subheader>

        <List.Item
          title="Phiên bản"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />

        <Divider />

        <List.Item
          title="Giới thiệu"
          description="Thông tin về ứng dụng"
          left={props => <List.Icon {...props} icon="information-outline" />}
          onPress={() => Alert.alert(
            'Lớp học thông minh',
            'Ứng dụng quản lý lớp học thông minh sử dụng ESP32 và Firebase.\n\nPhiên bản: 1.0.0'
          )}
        />

        <Divider />

        <List.Item
          title="Liên hệ hỗ trợ"
          description="Gửi email đến nhóm hỗ trợ"
          left={props => <List.Icon {...props} icon="email" />}
          onPress={() => handleLinkPress('mailto:support@example.com')}
        />
      </List.Section>
    </ScrollView>
  );
};

export default SettingsScreen;
