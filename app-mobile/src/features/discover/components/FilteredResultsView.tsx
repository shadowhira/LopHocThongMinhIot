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
import type { SearchResult } from "../types";
import ResultCard from "./ResultCard";
import { filterDisplayNames } from "../data/mockData";
import FilterContainer from "./FilterContainer";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

interface FilteredResultsViewProps {
  results: SearchResult[];
  activeFilters: Record<string, string>;
  onRemoveFilter: (category: string) => void;
  onCardPress?: () => void;
  onSortPress: () => void;
  onFilterPress: () => void;
}

// Map category IDs to display names
const categoryDisplayNames: Record<string, string> = {
  interest: "Interest",
  location: "Location",
  language: "Language",
  type: "Type",
  size: "Size",
  paidUnpaid: "Paid/Unpaid",
};

const FilteredResultsView: React.FC<FilteredResultsViewProps> = ({
  results,
  activeFilters,
  onRemoveFilter,
  onCardPress,
  onSortPress,
  onFilterPress,
}) => {
  // Convert filters to array for display
  const filtersArray = Object.entries(activeFilters).map(
    ([category, value]) => ({
      category,
      categoryName: categoryDisplayNames[category] || category,
      value: filterDisplayNames[category]?.[value] || value,
    })
  );

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      {filtersArray.length > 0 && (
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filtersArray.map((filter) => (
              <TouchableOpacity
                key={filter.category}
                style={styles.filterChip}
                onPress={() => onRemoveFilter(filter.category)}
              >
                <Feather name="x" size={14} color="#3B82F6" />
                <Text style={styles.filterChipText}>{filter.categoryName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results grid */}
      <ScrollView style={styles.resultsContainer}>
        <View style={styles.resultsGrid}>
          {results.map((item, index) => (
            <View key={item.id} style={styles.cardWrapper}>
              <ResultCard item={item} onPress={onCardPress} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  filtersWrapper: {
    // Giới hạn chiều cao của khu vực filter chips
    maxHeight: 60, // Điều chỉnh nếu cần
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF5FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    maxHeight: 32,
    width: "auto",
  },
  filterChipText: {
    color: "#3B82F6",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  resultsContainer: {
    flex: 1, // Đảm bảo phần kết quả chiếm toàn bộ không gian còn lại
  },
  resultsGrid: {
    padding: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: 60,
    paddingTop: 8,
    paddingRight: 20,
    paddingBottom: 8,
    paddingLeft: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: "65%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9999,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
});

export default FilteredResultsView;
