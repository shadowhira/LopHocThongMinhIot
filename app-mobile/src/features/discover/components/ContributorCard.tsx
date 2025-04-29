import { Feather } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ContributorCard = ({ contributor }: any) => {
  return (
    <View className="bg-white rounded-lg p-3 w-44 border border-gray-200 relative items-center">
      {/* Icon user-plus ở góc phải */}
      <TouchableOpacity className="absolute top-3 right-3">
        <Feather name="user-plus" size={20} color="#08A6FF" />
      </TouchableOpacity>

      {/* Avatar */}
      <Image
        source={{ uri: contributor.avatar }}
        className="w-16 h-16 rounded-full"
      />

      {/* Tên */}
      <Text className="text-base font-bold mt-2 text-center">
        {contributor.name}
      </Text>

      {/* Pronouns */}
      <Text className="text-sm text-gray-500 text-center">
        {contributor.gender}
      </Text>

      {/* Connections */}
      <Text className="text-sm text-gray-500 font-medium text-center">
        {contributor.connections}
      </Text>

      {/* Role */}
      <Text className="text-sm text-gray-800 mt-1 text-center" numberOfLines={1}>
        {contributor.role}
      </Text>
    </View>
  );
};

export default ContributorCard;
