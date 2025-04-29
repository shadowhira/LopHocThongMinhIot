"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/types";
import { Feather } from "@expo/vector-icons";
import { searchService } from "../services/searchService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNetwork } from "@/features/auth/context/NetworkContext";
import type { RouteProp } from "@react-navigation/native";
import { SearchHistoryItem } from "../types";
import { locationSuggestions } from "../data/mockData";
import { StyleSheet } from "react-native";

type SearchHistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SearchHistory"
>;
type SearchHistoryScreenRouteProp = RouteProp<
  RootStackParamList,
  "SearchHistory"
>;

const SearchHistoryScreen = () => {
  const navigation = useNavigation<SearchHistoryScreenNavigationProp>();
  const { user, saveUserLocation } = useAuth();
  const { isConnected } = useNetwork();
  const [searchText, setSearchText] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [filteredLocations, setFilteredLocations] =
    useState(locationSuggestions);

  const route = useRoute<SearchHistoryScreenRouteProp>();
  const [activeTab, setActiveTab] = useState(
    route.params?.activeTab || "Interest"
  );

  const loadSearchHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      if (isConnected) {
        await searchService.forceSync(user.id, activeTab);
      }
      const history = await searchService.getSearchHistory(user.id, activeTab);
      setSearchHistory(history);
    } catch (error) {
      console.error("Error loading search history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, user?.id, activeTab]);

  useEffect(() => {
    if (user?.id) {
      loadSearchHistory();
    }
  }, [user?.id, activeTab, loadSearchHistory]);

  useEffect(() => {
    if (isConnected && user?.id) {
      searchService
        .forceSync(user.id, activeTab)
        .then(() => loadSearchHistory())
        .catch((error) =>
          console.error("Error syncing search history:", error)
        );
    }
  }, [isConnected, user?.id, activeTab, loadSearchHistory]);

  useEffect(() => {
    if (activeTab === "Location") {
      setShowLocationModal(true);
      const filtered = locationSuggestions.filter((location) =>
        location.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setShowLocationModal(false);
      setFilteredLocations(locationSuggestions);
    }
  }, [searchText, activeTab]);

  const handleSearch = async () => {
    if (!user?.id || !searchText.trim()) return;
    await searchService.addSearchTerm(searchText.trim(), user.id, activeTab);
    await loadSearchHistory();
    navigation.navigate("SearchResults", {
      searchTerm: searchText.trim(),
      activeTab: activeTab,
      selectedLocation: false,
    });
  };

  const handleHistoryItemPress = async (term: string) => {
    if (!user?.id) return;
    await searchService.addSearchTerm(term, user.id, activeTab);
    await loadSearchHistory();
    navigation.navigate("SearchResults", {
      searchTerm: term,
      activeTab: activeTab,
      selectedLocation: activeTab === "Location" ? true : false,
    });
  };

  const handleRemoveHistoryItem = async (term: string) => {
    if (!user?.id) return;
    const confirmed =
      Platform.OS === "web"
        ? window.confirm(
            `Bạn có chắc chắn muốn xóa "${term}" khỏi lịch sử tìm kiếm?`
          )
        : await new Promise((resolve) =>
            Alert.alert(
              "Xóa tìm kiếm",
              `Bạn có chắc chắn muốn xóa "${term}" khỏi lịch sử tìm kiếm?`,
              [
                { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
                {
                  text: "Xóa",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ]
            )
          );
    if (confirmed) {
      await searchService.removeSearchTerm(term, user.id, activeTab);
      loadSearchHistory();
    }
  };

  const handleClearAllHistory = async () => {
    if (!user?.id || searchHistory.length === 0) return;
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Bạn có chắc chắn muốn xóa tất cả lịch sử tìm kiếm?")
        : await new Promise((resolve) =>
            Alert.alert(
              "Xóa tất cả lịch sử",
              "Bạn có chắc chắn muốn xóa tất cả lịch sử tìm kiếm?",
              [
                { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
                {
                  text: "Xóa tất cả",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ]
            )
          );
    if (confirmed) {
      await searchService.clearSearchHistory(user.id, activeTab);
      setSearchHistory([]);
    }
  };

  const handleBackPress = () => {
    navigation.navigate("SearchHome", { activeTab: "Interest" });
  };

  const handleClearInput = () => {
    setSearchText("");
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderLocationItem = ({
    item,
  }: {
    item: { id: string; name: string };
  }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleHistoryItemPress(item.name)}
    >
      <Feather name="map-pin" size={16} color="#666" />
      <Text style={styles.locationText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          {activeTab === "Interest" ? (
            <Feather name="search" size={20} color="#666" />
          ) : (
            <Feather name="map-pin" size={20} color="#666" />
          )}
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm kiếm"
            autoFocus
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
      {activeTab === "Interest" ? (
        <View style={styles.content}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Tìm kiếm gần đây</Text>
            {searchHistory.length > 0 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={handleClearAllHistory}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.clearAllText}>Xóa tất cả</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isConnected && (
            <View style={styles.offlineWarning}>
              <Feather name="wifi-off" size={16} color="#fff" />
              <Text style={styles.offlineText}>
                Bạn đang offline. Lịch sử tìm kiếm sẽ được đồng bộ khi có kết
                nối.
              </Text>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Đang tải...</Text>
            </View>
          ) : searchHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={50} color="#E5E7EB" />
              <Text style={styles.emptyText}>Chưa có lịch sử tìm kiếm</Text>
            </View>
          ) : (
            <FlatList
              data={searchHistory}
              keyExtractor={(item, index) => `${item.term}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <TouchableOpacity
                    style={styles.historyContent}
                    onPress={() => handleHistoryItemPress(item.term)}
                  >
                    <View style={styles.historyLeft}>
                      <Feather name="clock" size={16} color="#9CA3AF" />
                      <View style={styles.historyTextContainer}>
                        <Text style={styles.historyTerm}>{item.term}</Text>
                        <Text style={styles.historyTimestamp}>
                          {formatTimestamp(item.timestamp)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Feather name="arrow-up-right" size={14} color="#666" />
                      <Text style={styles.historyCount}>{item.count}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveHistoryItem(item.term)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="x" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>Gợi ý vị trí</Text>
          </View>
          {filteredLocations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="map-pin" size={50} color="#E5E7EB" />
              <Text style={styles.emptyText}>Không tìm thấy vị trí</Text>
            </View>
          ) : (
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id}
              renderItem={renderLocationItem}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  micButton: {
    marginLeft: 12,
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  clearAllButton: {
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 14,
    color: '#3B82F6', // blue-500
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B', // amber-500
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF', // gray-400
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // gray-100
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTextContainer: {
    marginLeft: 12,
  },
  historyTerm: {
    fontSize: 16,
    color: '#1F2937', // gray-800
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#9CA3AF', // gray-400
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4B5563', // gray-600
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 9999,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // gray-100
  },
  locationText: {
    fontSize: 16,
    color: '#1F2937', // gray-800
    marginLeft: 12,
  },
});

export default SearchHistoryScreen;