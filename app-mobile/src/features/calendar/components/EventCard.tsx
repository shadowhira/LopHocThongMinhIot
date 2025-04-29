import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarEvent } from '../types';

interface EventCardProps {
  event: CalendarEvent;
  onMorePress?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onMorePress }) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-base font-semibold text-gray-800">{event.title}</Text>
          
          <View className="flex-row items-center mt-2">
            <Text className="text-gray-600 text-sm">
              Today | {event.startTime} to {event.endTime}
            </Text>
          </View>
          
          {event.isLive && (
            <View className="flex-row items-center mt-2">
              <Feather name="map-pin" size={14} color="#4B5563" />
              <Text className="text-gray-600 text-sm ml-1">Live in {event.location}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity onPress={onMorePress} className="p-1">
          <Feather name="more-vertical" size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventCard;
