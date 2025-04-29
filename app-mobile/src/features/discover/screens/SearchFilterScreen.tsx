"use client";

import { Feather } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../../navigation/types";
import { filterCategories } from "../data/mockData";

type SearchFilterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SearchFilter"
>;

type SearchFilterScreenRouteProp = RouteProp<
  RootStackParamList,
  "SearchFilter"
>;

const SearchFilterScreen = () => {
  const navigation = useNavigation<SearchFilterScreenNavigationProp>();
  const route = useRoute<SearchFilterScreenRouteProp>();
  const { activeCategory = "interest", selectedFilters: initialFilters = {} } =
    route.params || {};

  const [selectedCategory, setSelectedCategory] = useState(activeCategory);
  const [selectedFilters, setSelectedFilters] =
    useState<Record<string, string>>(initialFilters);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedFilters]);

  const handleBackPress = () => {
    // Navigate back to SearchResults with the current filters
    if (route.params?.searchTerm) {
      navigation.navigate("SearchResults", {
        searchTerm: route.params.searchTerm,
        activeTab: route.params.activeTab || "Interest",
        selectedLocation: route.params.selectedLocation || false,
        location: route.params.location || "",
        appliedFilters: selectedFilters, // Pass back the current filters
        showFilteredResults: true, // Flag to show filtered results view
      });
    } else {
      navigation.goBack();
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleOptionPress = (optionId: string) => {
    // If "all" is selected, remove the filter for this category
    if (optionId === "all") {
      const newFilters = { ...selectedFilters };
      delete newFilters[selectedCategory];
      setSelectedFilters(newFilters);
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [selectedCategory]: optionId,
      });
    }
  };

  const handleApplyFilters = () => {
    // Remove any "all" filters as they don't need to be applied
    const cleanedFilters = { ...selectedFilters };
    Object.keys(cleanedFilters).forEach((key) => {
      if (cleanedFilters[key] === "all") {
        delete cleanedFilters[key];
      }
    });

    if (route.params?.searchTerm) {
      navigation.navigate("SearchResults", {
        searchTerm: route.params.searchTerm,
        activeTab: route.params.activeTab || "Interest",
        selectedLocation: route.params.selectedLocation || false,
        location: route.params.location || "",
        appliedFilters: cleanedFilters,
        showFilteredResults: true, // Flag to show filtered results view
      });
    } else {
      navigation.goBack();
    }
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
  };

  // Get current category options
  const currentCategoryOptions =
    filterCategories.find((category) => category.id === selectedCategory)
      ?.options || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {/* Left sidebar - Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {filterCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id &&
                    styles.selectedCategoryItem,
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right side - Options */}
        <View style={styles.optionsContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {currentCategoryOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => handleOptionPress(option.id)}
              >
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedFilters[selectedCategory] === option.id &&
                        styles.radioOuterSelected,
                    ]}
                  >
                    {selectedFilters[selectedCategory] === option.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.optionText}>{option.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Footer with Apply and Reset buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetFilters}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  categoriesContainer: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedCategoryItem: {
    backgroundColor: "#F3F4F6",
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  categoryText: {
    fontSize: 14,
    color: "#4B5563",
  },
  selectedCategoryText: {
    fontWeight: "500",
    color: "#1F2937",
  },
  optionsContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: "#3B82F6",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },
  optionText: {
    fontSize: 14,
    color: "#1F2937",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  resetButtonText: {
    color: "#4B5563",
    fontWeight: "500",
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
});

export default SearchFilterScreen;
