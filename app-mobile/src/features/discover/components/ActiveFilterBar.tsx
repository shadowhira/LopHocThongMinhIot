"use client";

import { Feather } from "@expo/vector-icons";
import type React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ActiveFiltersBarProps {
  filters: {
    category: string;
    value: string;
  }[];
  onRemoveFilter: (category: string) => void;
  onClearAll: () => void;
}

const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  if (filters.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={styles.filterChip}
            onPress={() => onRemoveFilter(filter.category)}
          >
            <Text style={styles.filterText}>{filter.value}</Text>
            <Feather name="x" size={16} color="#4B5563" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 4,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
});

export default ActiveFiltersBar;
