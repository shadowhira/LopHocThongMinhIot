import React, { useState } from 'react';
import { View, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import SearchBar from '../components/SearchBar';
import ChatListItem from '../components/ChatListItem';
import { chatConversations } from '../data/mockConversations';
import { ChatConversation } from '../types';

type HomeStackParamList = {
  Home: undefined;
  Profile: undefined;
  ViewProfile: undefined;
  EditProfile: undefined;
  ChatList: undefined;
  ChatDetail: { conversationId: string };
};

type ChatNavigationProp = StackNavigationProp<HomeStackParamList>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>(chatConversations);

  // Xử lý khi người dùng nhấn vào một cuộc trò chuyện
  const handleConversationPress = (conversationId: string) => {
    navigation.navigate('ChatDetail', { conversationId });
  };

  // Xử lý tìm kiếm
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setConversations(chatConversations);
      return;
    }

    const filtered = chatConversations.filter(conversation =>
      conversation.participants.some(participant =>
        participant.name.toLowerCase().includes(text.toLowerCase())
      ) ||
      conversation.lastMessage.content.toLowerCase().includes(text.toLowerCase())
    );

    setConversations(filtered);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      <View>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search"
        />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            conversation={item}
            onPress={handleConversationPress}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};



export default ChatListScreen;
