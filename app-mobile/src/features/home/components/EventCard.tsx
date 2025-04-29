import React from "react";
import { Dimensions, View, TouchableOpacity, Text, Image } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

interface EventCardProps {
  title: string;
  community: string;
  image: any;
  date: string;
  location: string;
}

const { width } = Dimensions.get("window");
const cardWidth = width * 0.75;

export const EventCard: React.FC<EventCardProps> = ({
  title,
  community,
  image,
  date,
  location,
}) => {
  return (
    <TouchableOpacity className="bg-white rounded-2xl mr-4 overflow-hidden shadow-sm" style={{ width: cardWidth }}>
      <Text className="text-lg font-semibold p-4">{community}</Text>
      <Image source={image} className="w-full h-[200px]" />

      <Text className="text-base font-semibold px-4 mb-3">{title}</Text>
      <View className="px-4 pb-4">
        <View className="flex-row items-center mb-2">
            <Feather name="calendar" size={16} color={"#666"} className="mr-2"/>
            <Text className="text-sm text-gray-600">{date}</Text>
        </View>

        <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color={"#666"} className="mr-2"/>
            <Text className="text-sm text-gray-600">{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};