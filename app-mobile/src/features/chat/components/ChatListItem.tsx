import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '@/navigation/types';
import { ChatConversation } from '../types';

interface ChatListItemProps {
  conversation: ChatConversation;
  onPress: (conversationId: string) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation, onPress }) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { id, participants, lastMessage, unreadCount } = conversation;
  const participant = participants[0]; // Lấy người tham gia đầu tiên (ngoài người dùng hiện tại)

  // Format timestamp
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  // Truncate message if it's too long
  const truncateMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Check if the message is from the current user
  const isFromCurrentUser = lastMessage.senderId === 'currentUser';

  return (
    <TouchableOpacity
      className="flex-row px-4 py-3 bg-white border-b border-gray-100"
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('DetailOtherUserProfile', { userId: participant.id })}
        activeOpacity={0.7}
      >
        <Image source={participant.avatar} className="w-[50px] h-[50px] rounded-full mr-3" />
      </TouchableOpacity>

      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-semibold text-black">{participant.name}</Text>
          <Text className="text-xs text-gray-500">{formatTime(lastMessage.timestamp)}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text
            className={`flex-1 text-sm ${!lastMessage.isRead && !isFromCurrentUser ? 'font-semibold text-black' : 'text-gray-500'}`}
            numberOfLines={1}
          >
            {isFromCurrentUser && <Text className="text-gray-500">You: </Text>}
            {truncateMessage(lastMessage.content)}
          </Text>

          {unreadCount > 0 && (
            <View className="bg-blue-500 rounded-full w-[20px] h-[20px] items-center justify-center">
              <Text className="text-xs text-white font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};



export default ChatListItem;
