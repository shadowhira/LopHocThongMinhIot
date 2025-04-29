import { FontAwesome } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
const ReviewCard = ({ review } : any) => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mt-8">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: review.avatar }}
          className="w-8 h-8 rounded-full mr-3"
        />
        <View>
          <Text className="font-semibold text-black text-sm">
            {review.name}
          </Text>
          {/* Stars */}
          <View className="flex-row mt-1">
            {[...Array(5)].map((_, i) => (
              <FontAwesome
                key={i}
                name={i < review.rating ? "star" : "star-o"}
                size={14}
                color="#FFA500"
              />
            ))}
          </View>
        </View>
      </View>
      {/* Content */}
      <Text className="text-sm text-gray-800">{review.content}</Text>
    </View>
  );
};


export default ReviewCard;
