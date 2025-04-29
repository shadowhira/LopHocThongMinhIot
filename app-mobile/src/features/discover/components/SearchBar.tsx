import type React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps {
  onPress: () => void;
  placeholder?: string;
  showLocationButton?: boolean;
  onLocationPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onPress,
  placeholder = "Tìm kiếm",
  showLocationButton = false,
  onLocationPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchButton} onPress={onPress}>
        {!showLocationButton ? (
          <Feather name="search" size={20} color="#666" />
        ) : (
          <Feather name="map-pin" size={20} color="#666" />
        )}
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  placeholderText: {
    marginLeft: 8,
    color: '#4B5563', // gray-600
    fontSize: 18,
  },
});

export default SearchBar;