import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface NotificationTabsProps {
  activeTab: 'all' | 'messages' | 'reminders';
  onTabChange: (tab: 'all' | 'messages' | 'reminders') => void;
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <View className="flex-row border-b border-gray-200 bg-white">
      <TouchableOpacity 
        className={`flex-1 py-3 px-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500' : ''}`}
        onPress={() => onTabChange('all')}
      >
        <Text 
          className={`text-center font-medium ${activeTab === 'all' ? 'text-blue-500' : 'text-gray-600'}`}
        >
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className={`flex-1 py-3 px-2 ${activeTab === 'messages' ? 'border-b-2 border-blue-500' : ''}`}
        onPress={() => onTabChange('messages')}
      >
        <Text 
          className={`text-center font-medium ${activeTab === 'messages' ? 'text-blue-500' : 'text-gray-600'}`}
        >
          Messages
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className={`flex-1 py-3 px-2 ${activeTab === 'reminders' ? 'border-b-2 border-blue-500' : ''}`}
        onPress={() => onTabChange('reminders')}
      >
        <Text 
          className={`text-center font-medium ${activeTab === 'reminders' ? 'text-blue-500' : 'text-gray-600'}`}
        >
          Reminders
        </Text>
      </TouchableOpacity>
    </View>
  );
};