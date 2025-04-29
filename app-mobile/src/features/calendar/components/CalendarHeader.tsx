import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CalendarHeaderProps {
  month: string;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month,
  year,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <TouchableOpacity onPress={onPrevMonth} className="p-2">
        <Feather name="chevron-left" size={24} color="white" />
      </TouchableOpacity>
      
      <Text className="text-white text-lg font-semibold">
        {month} {year}
      </Text>
      
      <TouchableOpacity onPress={onNextMonth} className="p-2">
        <Feather name="chevron-right" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default CalendarHeader;
