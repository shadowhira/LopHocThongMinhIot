import React from "react"
import { TouchableOpacity } from "react-native"
import { Image, View, Text } from "react-native"

interface CommunityCircleProps {
    name: string
    image: any
}

export const CommunityCircle: React.FC<CommunityCircleProps> = ({ name, image }) => {
    return (
        <TouchableOpacity className="items-center mr-4 w-20">
            <View className="w-[70px] h-[70px] rounded-full border-2 border-gray-200 p-0.5 bg-white justify-center items-center mb-1">
                {/* <Image source={image} className="w-[60px] h-[60px] rounded-full" /> */}
                {image ? (
          <Image source={image} className="w-[60px] h-[60px] rounded-full" />
        ) : (
          <Text>Image not found</Text> // Hiển thị thông báo nếu image không hợp lệ
        )}
            </View>
            <Text className="text-xs text-center font-medium" numberOfLines={1}>
                {name}
            </Text>
        </TouchableOpacity>
    )
}