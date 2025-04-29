import React from 'react';
import { View, Text } from 'react-native';

interface MonthSelectorProps {
  currentDay: number;
  currentMonth: string; // Giữ lại để tránh thay đổi interface, nhưng không sử dụng
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ currentDay }) => {

  return (
    <View className="w-14 h-14 bg-blue-500 rounded-md items-center justify-center">
      <Text className="text-2xl font-bold text-white">{currentDay}</Text>
    </View>
  );
};

export default MonthSelector;
