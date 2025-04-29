import { View, Text, Image } from "react-native"
import { Feather } from "@expo/vector-icons"

interface RecommendedCommunityProps {
  id: string
  name: string
  image: any
  members: number
  rating: number
  activeUsers: number
  description: string
  isNew?: boolean
}

const RecommendedCommunity = ({
  name,
  image,
  members,
  rating,
  activeUsers,
  description,
  isNew = false,
}: RecommendedCommunityProps) => {
  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-3 mr-3" style={{ width: 186, height: 268 }}>
      <View className="relative">
        <Image source={image} style={{ width: 186, height: 100 }} resizeMode="cover" />
        <View className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-full">
          <Text className="text-white text-xs">• {activeUsers}+</Text>
        </View>

        <View className="absolute -bottom-8 left-4 w-14 h-14 rounded-full bg-white items-center justify-center border-2 border-white">
          <Image source={image} className="w-12 h-12 rounded-full" resizeMode="cover" />
        </View>
      </View>

      <View className="pt-10 px-3 pb-3" style={{ height: 168 }}>
        <View className="flex-row items-center mb-1">
          <Text className="text-sm font-bold" numberOfLines={1}>
            {name}
          </Text>
          <View className="ml-auto flex-row items-center bg-orange-100 px-1.5 py-0.5 rounded">
            <Feather name="star" size={10} color="#f59e0b" />
            <Text className="text-orange-500 text-xs ml-0.5">{rating.toFixed(1)}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-1">
          <Text className="text-slate-600 text-xs">{members} thành viên</Text>
          {isNew && <Text className="text-slate-400 text-xs ml-1">• Mới</Text>}
        </View>

        <Text className="text-slate-600 text-xs" numberOfLines={3}>
          {description}
        </Text>
      </View>
    </View>
  )
}

export default RecommendedCommunity
