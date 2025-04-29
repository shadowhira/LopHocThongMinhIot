import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '@/navigation/types';

interface ChatHeaderProps {
  title: string;
  avatar?: any;
  userId?: string;
  onBackPress?: () => void;
  onMorePress?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  avatar,
  userId = 'user-001',
  onBackPress,
  onMorePress,
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
      <View className="flex-row items-center">
        <TouchableOpacity
          className="p-1.5 mr-2"
          onPress={handleBackPress}
        >
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('DetailOtherUserProfile', { userId })}
          className="flex-row items-center"
        >
          <Image
            source={avatar || { uri: 'https://ui-avatars.com/api/?name=' + (title || 'User') + '&background=E91E63&color=fff' }}
            className="w-9 h-9 rounded-full mr-2"
          />

          <Text className="text-lg font-semibold text-black">{title}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="p-1.5"
        onPress={onMorePress}
      >
        <Feather name="more-vertical" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};



export default ChatHeader;
