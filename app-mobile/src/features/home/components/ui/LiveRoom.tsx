import { View, Text, TouchableOpacity, Image } from "react-native"
import { Feather } from "@expo/vector-icons"

interface LiveRoomProps {
  title: string
  host: {
    name: string
    image: any
    description: string
  }
  listeners: number
  avatars: any[]
}

const LiveRoom = ({ title, host, listeners, avatars }: LiveRoomProps) => {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center mb-1">
        <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
        <Text className="text-lg font-medium text-slate-500">Live</Text>
        <TouchableOpacity className="ml-auto">
          <Feather name="more-vertical" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View className="border-b border-slate-100 pb-4 mb-4">
        <Text className="text-2xl font-bold mb-4">{title}</Text>

        <View className="flex-row mb-2">
          {avatars.map((avatar, index) => (
            <Image
              key={index}
              source={avatar}
              className="w-8 h-8 rounded-full border-2 border-white"
              style={{ marginLeft: index > 0 ? -10 : 0 }}
            />
          ))}
          <Text className="ml-2 text-slate-600 self-center">and {listeners} others are listening</Text>
        </View>
      </View>

      <View className="flex-row">
        <Image source={host.image} className="w-12 h-12 rounded-full mr-3" />
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-bold">{host.name}</Text>
            <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
              <Text className="text-xs text-blue-600">Host</Text>
            </View>
          </View>
          <Text className="text-sm text-slate-600">{host.description}</Text>
        </View>
      </View>
    </View>
  )
}

export default LiveRoom
