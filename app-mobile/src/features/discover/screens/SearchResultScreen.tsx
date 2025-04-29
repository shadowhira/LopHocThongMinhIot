"use client";
import { useNetwork } from "@/features/auth/context/NetworkContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Feather } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState, useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../../navigation/types";
import ActiveFiltersBar from "../components/ActiveFilterBar";
import FilterContainer from "../components/FilterContainer";
import FilteredResultsView from "../components/FilteredResultsView";
import LocationAccessModal from "../components/LocationAccessModal";
import ResultCard from "../components/ResultCard";
import SortByModal from "../components/SortByModal";
import TabContainer from "../components/TabContainer";
import { filterDisplayNames, mockResults } from "../data/mockData";
import { searchService } from "../services/searchService";
import type { SearchResult } from "../types";

type SearchResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SearchResults"
>;
type SearchResultsScreenRouteProp = RouteProp<
  RootStackParamList,
  "SearchResults"
>;

const { width } = Dimensions.get("window");

const SearchResultsScreen = () => {
  const navigation = useNavigation<SearchResultsScreenNavigationProp>();
  const route = useRoute<SearchResultsScreenRouteProp>();
  const {
    searchTerm,
    fromCategory,
    activeTab: initialActiveTab,
    selectedLocation,
    location,
    appliedFilters = {},
    showFilteredResults = false, // New flag to show filtered results view
  } = route.params;
  const { user, saveUserLocation } = useAuth();
  const { isConnected } = useNetwork();

  const [searchText, setSearchText] = useState(searchTerm || "");
  const [showResults, setShowResults] = useState(fromCategory || false);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState(initialActiveTab || "Interest");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [skip, setSkip] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    appliedFilters || {}
  );
  const [viewMode, setViewMode] = useState<"standard" | "filtered">(
    showFilteredResults ? "filtered" : "standard"
  );

  useEffect(() => {
    if (searchTerm && user?.id) {
      fetchResults(searchText);
    }
    if (
      activeTab === "Location" &&
      !selectedLocation &&
      !skip &&
      !user?.location
    ) {
      setShowPermissionModal(true);
    } else {
      setShowPermissionModal(false);
    }
  }, [
    showPermissionModal,
    selectedLocation,
    activeTab,
    searchTerm,
    user?.id,
    fromCategory,
  ]);

  // Update active filters when route params change
  useEffect(() => {
    if (route.params?.appliedFilters) {
      setActiveFilters(route.params.appliedFilters);
    }

    // Update view mode based on showFilteredResults flag
    if (route.params?.showFilteredResults) {
      setViewMode("filtered");
    }
  }, [route.params?.appliedFilters, route.params?.showFilteredResults]);

  const handleAllowLocation = async () => {
    setShowPermissionModal(false);
    const location = "Ha Noi, Viet Nam";
    if (user?.id) {
      await saveUserLocation(location);
    }
    navigation.navigate("SearchResults", {
      searchTerm: location.trim(),
      activeTab: "Location",
      selectedLocation: true,
      location: location.trim(),
    });
  };

  const handleSkipLocation = () => {
    setShowPermissionModal(false);
    setSkip(true);
    navigation.navigate("Main", {
      screen: "Discover",
      params: {
        screen: "SearchHistory",
        params: { activeTab: activeTab },
      },
    });
  };

  const saveSearchTerm = async (term: string) => {
    if (!user?.id) return;

    try {
      await searchService.addSearchTerm(term, user.id, activeTab);
      if (isConnected) {
        await searchService.forceSync(user.id, activeTab);
      }
    } catch (error) {
      console.error("Error saving search term:", error);
    }
  };

  const fetchResults = async (term: string) => {
    setSearchText(term);
    setIsLoading(true);
    setTimeout(() => {
      let filteredResults = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(term.toLowerCase()) ||
          result.category.toLowerCase().includes(term.toLowerCase()) ||
          result.description.toLowerCase().includes(term.toLowerCase())
      );

      // Apply sorting
      filteredResults = sortResults(filteredResults, sortOption);

      setResults(filteredResults.length > 0 ? filteredResults : mockResults);
      setIsLoading(false);
      setShowResults(true);
    }, 500);
  };

  const sortResults = (results: SearchResult[], sortBy: string) => {
    const sortedResults = [...results];

    switch (sortBy) {
      case "newest":
        return sortedResults.sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );
      case "oldest":
        return sortedResults.sort(
          (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
        );
      case "mostPopular":
        return sortedResults.sort(
          (a, b) => (b.members || 0) - (a.members || 0)
        );
      case "mostReviewed":
        return sortedResults.sort(
          (a, b) => (b.reviews || 0) - (a.reviews || 0)
        );
      case "relevance":
      default:
        return sortedResults;
    }
  };

  const handleSearch = async () => {
    if (searchText.trim() && user?.id) {
      await saveSearchTerm(searchText.trim());
      fetchResults(searchText.trim());
    }
  };

  const handleBackPress = () => {
    navigation.navigate("Main", {
      screen: "Discover",
      params: {
        screen: "SearchHistory",
        params: { activeTab: activeTab },
      },
    });
  };

  const handleNextScreen = () => {
    navigation.navigate("SpaceProfile", { spaceId: "space-001" });
  };

  const handleClearInput = () => {
    setSearchText("");
    setShowResults(false);
    handleBackPress();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (user?.location)
      setSearchText(tab === "Interest" ? searchTerm : user.location);
    if (tab === "Interest" && selectedLocation) {
      navigation.navigate("Main", {
        screen: "Discover",
        params: {
          screen: "SearchHistory",
          params: { activeTab: tab },
        },
      });
    }
  };

  const handleSortSelect = (option: string) => {
    setSortOption(option);
    // Re-fetch results with new sort option
    fetchResults(searchText);
  };

  // Convert active filters to array format for ActiveFiltersBar
  const activeFiltersArray = useMemo(() => {
    return Object.entries(activeFilters).map(([category, value]) => ({
      category,
      value: filterDisplayNames[category]?.[value] || value,
    }));
  }, [activeFilters]);

  const handleRemoveFilter = (category: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[category];
    setActiveFilters(newFilters);

    // If all filters are removed, switch back to standard view
    if (Object.keys(newFilters).length === 0) {
      setViewMode("standard");
    }
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setViewMode("standard");
  };

  const navigateToFilterScreen = () => {
    // Navigate to filter screen
    navigation.navigate("Main", {
      screen: "Discover",
      params: {
        screen: "SearchFilter",
        params: {
          searchTerm,
          activeTab,
          selectedLocation,
          location,
          activeCategory: "interest",
          selectedFilters: activeFilters,
        },
      },
    });
  };

  const renderTabContainer = () => (
    <TabContainer
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabs={[
        { id: "Interest", label: "Interest" },
        { id: "Location", label: "Location" },
      ]}
    />
  );

  const renderStandardResults = () => (
    <View style={styles.resultsContainer}>
      {renderTabContainer()}

      {/* Active Filters Bar */}
      <ActiveFiltersBar
        filters={activeFiltersArray}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {!isConnected && (
        <View style={styles.offlineWarning}>
          <Feather name="wifi-off" size={16} color="#fff" />
          <Text style={styles.offlineText}>
            Bạn đang offline. Lịch sử tìm kiếm sẽ được đồng bộ khi có kết nối.
          </Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === "Interest" ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {results.map((item) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  onPress={handleNextScreen}
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Interests</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {results
                .slice()
                .reverse()
                .map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
            </ScrollView>
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Locations</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {results.map((item) => (
                <ResultCard key={item.id} item={item} />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Destinations</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {results
                .slice()
                .reverse()
                .map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      <FilterContainer
        onSortPress={() => setShowSortModal(true)}
        onFilterPress={navigateToFilterScreen}
      />

      <SortByModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        onSelect={handleSortSelect}
        selectedOption={sortOption}
      />
    </View>
  );

  const renderFilteredResults = () => (
    <View style={styles.resultsContainer}>
      <FilteredResultsView
        results={results}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onCardPress={handleNextScreen}
        onSortPress={() => setShowSortModal(true)}
        onFilterPress={navigateToFilterScreen}
      />
      <FilterContainer
        onSortPress={() => setShowSortModal(true)}
        onFilterPress={navigateToFilterScreen}
      />

      <SortByModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        onSelect={handleSortSelect}
        selectedOption={sortOption}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Hiển thị Modal nếu cần */}
      {showPermissionModal && (
        <LocationAccessModal
          visible={showPermissionModal}
          onAllow={handleAllowLocation}
          onSkip={handleSkipLocation}
        />
      )}

      {/* Thanh Tìm Kiếm */}
      {!showPermissionModal && viewMode !== "filtered" && (
        <View style={styles.searchBarContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm kiếm"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleClearInput}>
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.micButton}>
            <Feather name="mic" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Nội dung chính */}
      {!showPermissionModal ? (
        isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Đang tải...</Text>
          </View>
        ) : showResults ? (
          viewMode === "filtered" ? (
            renderFilteredResults()
          ) : (
            renderStandardResults()
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={50} color="#E5E7EB" />
            <Text style={styles.emptyText}>Nhập từ khóa để tìm kiếm</Text>
          </View>
        )
      ) : (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Vui lòng cấp quyền để tiếp tục
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // gray-200
  },
  backButton: {
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6", // gray-100
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
  micButton: {
    marginLeft: 12,
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  offlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B", // amber-500
    padding: 10,
    borderRadius: 8,
    margin: 16,
  },
  offlineText: {
    color: "white",
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 16,
  },
  horizontalScrollContent: {
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9CA3AF", // gray-400
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#9CA3AF", // gray-400
  },
});

export default SearchResultsScreen;
