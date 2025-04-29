import React from 'react';
import { View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NotificationType } from '../types';

interface NotificationIconProps {
  type: NotificationType;
  icon?: string;
  color?: string;
  sender?: {
    avatar?: string;
  };
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ 
  type, 
  icon, 
  color = '#4a86e8',
  sender
}) => {
  // Nếu có avatar của người gửi, hiển thị avatar
  if (type === 'message' && sender?.avatar) {
    return (
      <View className="w-10 h-10 rounded-full overflow-hidden">
        <Image 
          source={{ uri: sender.avatar }} 
          className="w-full h-full"
        />
      </View>
    );
  }

  // Nếu có icon tùy chỉnh, hiển thị icon đó
  if (icon) {
    return (
      <View className="w-10 h-10 rounded-full overflow-hidden">
        <Image 
          source={{ uri: icon }} 
          className="w-full h-full"
        />
      </View>
    );
  }

  // Mặc định, hiển thị icon dựa trên loại thông báo
  const getIconName = () => {
    switch (type) {
      case 'message':
        return 'message-circle';
      case 'reminder':
        return 'bell';
      case 'article':
        return 'file-text';
      case 'event':
        return 'calendar';
      case 'challenge':
        return 'award';
      case 'community':
        return 'users';
      default:
        return 'bell';
    }
  };

  const getBackgroundColor = () => {
    if (color) return color;
    
    switch (type) {
      case 'message':
        return 'bg-blue-500';
      case 'reminder':
        return 'bg-yellow-500';
      case 'article':
        return 'bg-red-500';
      case 'event':
        return 'bg-purple-500';
      case 'challenge':
        return 'bg-green-500';
      case 'community':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <View className={`w-10 h-10 rounded-full ${getBackgroundColor()} items-center justify-center`}>
      <Feather name={getIconName()} size={20} color="#fff" />
    </View>
  );
};