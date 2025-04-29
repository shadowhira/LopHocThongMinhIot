import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { List, Divider, Switch } from 'react-native-paper';

const SettingsScreen: React.FC = () => {
  // State cho các cài đặt
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Cài đặt</Text>
      
      <List.Section>
        <List.Subheader>Giao diện</List.Subheader>
        
        <List.Item
          title="Chế độ tối"
          description="Thay đổi giao diện sang màu tối"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={props => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled={true} // Tính năng chưa được hỗ trợ
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
});

export default SettingsScreen;
