import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ChatHeader from '../components/ChatHeader';
import { chatConversations } from '../data/mockConversations';
import { mockMessages } from '../data/mockMessages';
import { ChatMessage } from '../types';

type HomeStackParamList = {
  Home: undefined;
  Profile: undefined;
  ViewProfile: undefined;
  EditProfile: undefined;
  ChatList: undefined;
  ChatDetail: { conversationId: string };
};

type ChatDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ChatDetail'>;

const ChatDetailScreen: React.FC = () => {
  const route = useRoute<ChatDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { conversationId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages[conversationId] || []);
  const flatListRef = useRef<FlatList>(null);

  // Tìm cuộc trò chuyện từ ID
  const conversation = chatConversations.find(c => c.id === conversationId);
  const participant = conversation?.participants[0];

  // Sử dụng useLayoutEffect để ẩn thanh bottomBar khi màn hình này được hiển thị
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' }
      });
    }

    // Khi rời khỏi màn hình, hiển thị lại thanh bottomBar
    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: undefined
        });
      }
    };
  }, [navigation]);

  // Gửi tin nhắn mới
  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'currentUser',
      receiverId: participant?.id || '',
      content: message,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Cuộn xuống tin nhắn mới nhất
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Hiển thị một tin nhắn
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.senderId === 'currentUser';

    return (
      <View className={`mb-4 max-w-[80%] ${isCurrentUser ? 'self-end items-end' : 'self-start items-start'}`}>
        <View
          className={`rounded-2xl px-3 py-2 mb-1 ${isCurrentUser ? 'bg-blue-500 rounded-br-md' : 'bg-gray-200 rounded-bl-md'}`}
        >
          <Text
            className={`text-base ${isCurrentUser ? 'text-white' : 'text-black'}`}
          >
            {item.content}
          </Text>
        </View>
        <Text className="text-xs text-gray-500">
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  // Format thời gian
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom', 'top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ChatHeader
        title={participant?.name || 'Chat'}
        avatar={participant?.avatar}
        userId={participant?.id}
        onMorePress={() => console.log('More pressed')}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View className="flex-row items-center px-3 py-2.5 bg-white border-t border-gray-100 shadow-sm">
          <TouchableOpacity className="p-2">
            <Feather name="plus" size={24} color="#007AFF" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 mx-2 text-base border border-gray-200"
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity
            className="p-2"
            onPress={sendMessage}
            disabled={message.trim() === ''}
          >
            <Feather
              name="send"
              size={20}
              color={message.trim() === '' ? '#8E8E93' : '#007AFF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



export default ChatDetailScreen;
