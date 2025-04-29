import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarDay } from '../types';

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDate: number;
  onSelectDate: (day: number) => void;
  highlightedDates: number[];
}

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  selectedDate,
  onSelectDate,
  highlightedDates,
}) => {
  return (
    <View className="px-4 pb-4">
      {/* Weekday headers */}
      <View className="flex-row mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={{ flex: 1 }} className="items-center">
            <Text className="text-gray-300 text-xs font-medium">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View>
        {/* Chia lịch thành các hàng rõ ràng (mỗi hàng 7 ngày) */}
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <View key={`week-${weekIndex}`} className="flex-row mb-1">
            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
              const isSelected = day.date === selectedDate && day.isCurrentMonth;
              const hasEvent = highlightedDates.includes(day.date) && day.isCurrentMonth;

              return (
                <TouchableOpacity
                  key={`day-${weekIndex}-${dayIndex}`}
                  onPress={() => day.isCurrentMonth && onSelectDate(day.date)}
                  style={{ flex: 1 }}
                  className="items-center justify-center py-1"
                  disabled={!day.isCurrentMonth}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center
                      ${isSelected ? 'bg-blue-500' : hasEvent ? 'bg-blue-500/30' : 'bg-transparent'}
                      ${day.isToday && !isSelected ? 'border border-white' : ''}
                    `}
                  >
                    <Text
                      className={`text-sm
                        ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                        ${isSelected ? 'font-bold' : ''}
                      `}
                    >
                      {day.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default CalendarGrid;
