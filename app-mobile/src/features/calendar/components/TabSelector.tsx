import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TabType } from '../types';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="flex-row border-b border-gray-200">
      <TouchableOpacity
        onPress={() => onTabChange('Discussions')}
        className={`py-3 px-4 ${activeTab === 'Discussions' ? 'border-b-2 border-blue-500' : ''}`}
      >
        <Text
          className={`text-base ${
            activeTab === 'Discussions' ? 'font-semibold text-blue-500' : 'text-gray-600'
          }`}
        >
          Discussions
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => onTabChange('Events')}
        className={`py-3 px-4 ${activeTab === 'Events' ? 'border-b-2 border-blue-500' : ''}`}
      >
        <Text
          className={`text-base ${
            activeTab === 'Events' ? 'font-semibold text-blue-500' : 'text-gray-600'
          }`}
        >
          Events
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabSelector;
