import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Notification } from '../types';
import { NotificationIcon } from './NotificationIcon';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onPress 
}) => {
  const { title, content, timestamp, read, type, sender, icon, color } = notification;

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return 'now';
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}min`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}h`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}d`;
    }
    
    // Otherwise show date
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <TouchableOpacity 
      className={`flex-row p-4 border-b border-gray-200 ${!read ? 'bg-blue-50' : ''}`}
      onPress={() => onPress(notification)}
    >
      <NotificationIcon 
        type={type} 
        icon={icon} 
        color={color}
        sender={sender}
      />
      
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-start">
          <Text className="flex-1 text-base font-medium" numberOfLines={2}>
            {title}
          </Text>
          <Text className="text-xs text-gray-500 ml-2">
            {formatTimestamp(timestamp)}
          </Text>
        </View>
        
        <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
          {content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};