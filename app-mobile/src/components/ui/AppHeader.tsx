import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface AppHeaderProps {
  title?: string;
  showStylizedTitle?: boolean;
  stylizedTitle?: string;
  onProfilePress?: () => void;
  onChatPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showStylizedTitle = false,
  stylizedTitle = "Socialize",
  onProfilePress,
  onChatPress,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Kiểm tra xem hiện tại đang ở màn hình nào
  const currentRouteName = route.name;

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      try {
        // Kiểm tra xem hiện tại đang ở màn hình nào
        if (currentRouteName === 'Home') {
          // Nếu đang ở Home, điều hướng trực tiếp đến Profile
          // @ts-ignore - Bỏ qua lỗi TypeScript
          navigation.navigate('Profile');
        } else {
          // Nếu đang ở màn hình khác, điều hướng qua HomeStack trước
          // @ts-ignore - Bỏ qua lỗi TypeScript
          navigation.navigate('Home', { screen: 'Profile' });
        }
      } catch (error) {
        console.log('Navigation error:', error);
        // Thử phương án dự phòng
        try {
          // @ts-ignore - Bỏ qua lỗi TypeScript
          navigation.navigate('Profile');
        } catch (innerError) {
          console.log('Fallback navigation error:', innerError);
        }
      }
    }
  };

  const handleChatPress = () => {
    if (onChatPress) {
      onChatPress();
    } else {
      try {
        // Kiểm tra xem hiện tại đang ở màn hình nào
        if (currentRouteName === 'Home') {
          // Nếu đang ở Home, điều hướng trực tiếp đến ChatList
          // @ts-ignore - Bỏ qua lỗi TypeScript
          navigation.navigate('ChatList');
        } else {
          // Nếu đang ở màn hình khác, điều hướng qua HomeStack trước
          // @ts-ignore - Bỏ qua lỗi TypeScript
          navigation.navigate('Home', { screen: 'ChatList' });
        }
      } catch (error) {
        console.log('Navigation error:', error);
        try {
          // @ts-ignore - Bỏ qua lỗi TypeScript
          navigation.navigate('ChatList');
        } catch (innerError) {
          console.log('Fallback navigation error:', innerError);
        }
      }
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#e5eef7" />
      <View className="bg-[#e5eef7] pt-2 pb-3 shadow-sm border-b border-gray-200"
      style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        <View className="flex-row items-center justify-between px-4">
          <TouchableOpacity
            className="w-10 h-10 rounded-full flex items-center justify-center"
            onPress={handleProfilePress}
          >
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <View
                className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">
                  {(user?.displayName?.substring(0, 2) || user?.email?.substring(0, 2) || 'U').toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {showStylizedTitle ? (
            <View className="flex-1 items-center justify-center">
              <Text
                className="text-3xl font-semibold text-blue-500 italic"
                style={{
                  fontFamily: 'cursive',
                  textShadowColor: 'rgba(59, 130, 246, 0.2)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                  letterSpacing: 1
                }}
              >
                {stylizedTitle}
              </Text>
            </View>
          ) : (
            <Text className="text-lg font-semibold text-black">
              {title}
            </Text>
          )}

          <TouchableOpacity
            className="w-10 h-10 flex items-center justify-center"
            onPress={handleChatPress}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#0f3c73" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AppHeader;
