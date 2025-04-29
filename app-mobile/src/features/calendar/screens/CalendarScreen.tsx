import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/ui/AppHeader';

import TabSelector from '../components/TabSelector';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';
import { TabType, CalendarEvent } from '../types';
import { mockEvents, highlightedDates } from '../data/mockCalendarData';

const CalendarScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Discussions');
  // Lấy ngày hiện tại làm ngày mặc định được chọn
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);

  // Lọc sự kiện dựa trên ngày được chọn
  useEffect(() => {
    const events = mockEvents.filter(event => {
      return event.date.getDate() === selectedDate;
    });
    setFilteredEvents(events);
  }, [selectedDate]);

  // Xử lý khi chọn ngày
  const handleSelectDate = (day: number) => {
    setSelectedDate(day);
  };

  // Xử lý khi chọn tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <AppHeader title="Calendar" />

      {/* Tab Selector */}
      <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <View className="flex-1 p-4">
        {/* Calendar */}
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          highlightedDates={highlightedDates}
        />

        {/* Events List */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onMorePress={() => console.log('More pressed for event:', item.id)}
            />
          )}
          className="mt-4"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">No events for this date</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default CalendarScreen;