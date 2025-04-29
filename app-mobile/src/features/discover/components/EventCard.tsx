import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

const EventCard = ({event} : any) => {
  return (
    <View className="bg-[#f9f8f7] rounded-2xl overflow-hidden shadow-md mt-8">
      {/* Image with overlay */}
      <View className="relative">
        <Image
          source={{ uri: event.thumbnail }}
          className="w-full h-64"
          resizeMode="cover"
        />
        {/* Overlay */}
        <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent px-4 justify-end pb-2" />
      </View>

      {/* Indicator (optional) */}
      <View className="flex-row justify-center mt-[10px] mb-2">
        <View className="w-2 h-2 rounded-full bg-gray-400 mx-1" />
        <View className="w-2 h-2 rounded-full bg-gray-300 mx-1" />
        <View className="w-2 h-2 rounded-full bg-gray-300 mx-1" />
      </View>

      {/* Info */}
      <View className="px-4 pb-4">
        <Text className="text-base font-semibold text-black mb-2">
          {event.name}
        </Text>

        <View className="flex-row items-center mb-1">
          <Feather name="calendar" size={16} color="#555" />
          <Text className="ml-2 text-sm text-gray-700">
            {event.time}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Feather name="map-pin" size={16} color="#555" />
          <Text className="ml-2 text-sm text-gray-700">
            {event.location}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EventCard;