import { Feather } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
interface IPost {
  id: string;
  name: string;
  avatar: string;
  description: string;
  time: string;
  content: string;
  image: string;
  likes: number;
  comments: number;
}

export default function PostCard ({post} : any) {
    return(
      <View className="mt-8">
        {/* Post Header */}
        <View className="flex-row items-center mb-2 ml-2">
          <Image
              source={{ uri: post.avatar }}
              className="w-10 h-10 rounded-full mr-3"
          />
          <View className="flex-1">
              <Text className="text-sm font-semibold text-black">{post.name}</Text>
              <Text className="text-xs text-gray-500">
              {post.description} • {post.time}
              </Text>
          </View>
        </View>

        {/* Post Text */}
        <Text className="text-sm text-gray-800 mb-3 ml-2">{post.content}</Text>

        {/* Post Image */}
        <Image
          source={{ uri: post.image }}
          className="w-full h-60 mb-3"
          resizeMode="cover"
        />

        {/* Likes and Comments */}
        <View className="flex-row justify-between px-1 mb-3 mx-2">
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-blue-400 justify-center items-center mr-1.5">
              <Feather name="thumbs-up" size={16} color="#fff" />
            </View>
            <Text className="text-base text-gray-600">{post.likes} Likes</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="message-circle" size={16} color="#fff" />
            <Text className="text-base text-gray-600">{post.comments} comments</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-around border-t border-b border-gray-200 py-2">
          <TouchableOpacity className="items-center">
              <Feather name="thumbs-up" size={20} color="#555" />
              <Text className="text-xs text-gray-600 mt-1">Like</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
              <Feather name="thumbs-down" size={20} color="#555" />
              <Text className="text-xs text-gray-600 mt-1">Dislike</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
              <Feather name="message-circle" size={20} color="#555" />
              <Text className="text-xs text-gray-600 mt-1">Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
              <Feather name="share-2" size={20} color="#555" />
              <Text className="text-xs text-gray-600 mt-1">Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
}