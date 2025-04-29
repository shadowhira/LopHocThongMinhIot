import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onPress,
  placeholder = 'Search',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      className="px-4 py-2"
    >
      <View className="flex-row items-center bg-gray-200 rounded-lg px-3 py-2 h-9">
        <Feather name="search" size={20} color="#8E8E93" className="mr-2" />
        <TextInput
          className="flex-1 text-base text-black h-6 p-0"
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          value={value}
          onChangeText={onChangeText}
          editable={!onPress}
        />
      </View>
    </TouchableOpacity>
  );
};



export default SearchBar;
