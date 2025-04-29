"use client";

import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../../navigation/types";
import { interests, locationSuggestions } from "../data/mockData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import SearchBar from "../components/SearchBar";
import TabContainer from "../components/TabContainer";
import LocationAccessModal from "../components/LocationAccessModal";

type SearchHomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SearchHome"
>;
type SearchHomeScreenRouteProp = RouteProp<RootStackParamList, "SearchHome">;

const { width } = Dimensions.get("window");

const SearchHomeScreen = () => {
  const navigation = useNavigation<SearchHomeScreenNavigationProp>();
  const { user, userProfile, saveUserLocation } = useAuth();
  const route = useRoute<SearchHomeScreenRouteProp>();
  const [activeTab, setActiveTab] = useState(
    route.params?.activeTab || "Interest"
  );

  // State for Location tab
  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [filteredLocations, setFilteredLocations] =
    useState(locationSuggestions);
  const [hasSkippedPermission, setHasSkippedPermission] = useState(false);

  useEffect(() => {
    if (searchText) {
      const filtered = locationSuggestions.filter((location) =>
        location.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locationSuggestions);
    }
  }, [searchText]);

  useEffect(() => {
    if (
      activeTab === "Location" &&
      !selectedLocation &&
      !user?.location &&
      !hasSkippedPermission
    ) {
      setShowPermissionModal(true);
    } else {
      setShowPermissionModal(false);
      if (user?.location && activeTab === "Location") {
        navigation.navigate("SearchResults", {
          searchTerm: user.location.trim(),
          activeTab: activeTab,
          selectedLocation: true,
          location: user.location.trim(),
        });
      }
    }
  }, [
    activeTab,
    selectedLocation,
    user?.location,
    showPermissionModal,
    hasSkippedPermission,
    navigation,
  ]);

  const handleSearchPress = () => {
    navigation.navigate("SearchHistory", {
      activeTab: activeTab,
    });
  };

  const handleCategoryPress = (category: string) => {
    navigation.navigate("SearchResults", {
      searchTerm: category,
      fromCategory: true,
      activeTab: activeTab,
      selectedLocation: false,
    });
  };

  const handleAllowLocation = async () => {
    setShowPermissionModal(false);
    const location = "Ha Noi, Viet Nam";
    if (user?.id) {
      await saveUserLocation(location);
    }
    setSelectedLocation(location);
    navigation.navigate("SearchResults", {
      searchTerm: location.trim(),
      activeTab: activeTab,
      selectedLocation: true,
      location: location.trim(),
    });
  };

  const handleSkipLocation = () => {
    setShowPermissionModal(false);
    setHasSkippedPermission(true);
    setActiveTab("Location");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const categories = interests.filter((interest) => {
    return userProfile.interests.includes(interest.name);
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <LocationAccessModal
        visible={showPermissionModal}
        onAllow={handleAllowLocation}
        onSkip={handleSkipLocation}
      />

      <SearchBar
        onPress={handleSearchPress}
        showLocationButton={activeTab === "Location"}
        onLocationPress={() => setShowLocationModal(true)}
      />

      <TabContainer
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={[
          { id: "Interest", label: "Interest" },
          { id: "Location", label: "Location" },
        ]}
      />

      {activeTab === "Interest" ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoryContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  index % 2 === 1 ? { marginRight: 0 } : null, // Remove marginRight for right column
                ]}
                onPress={() => handleCategoryPress(category.name)}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <View style={styles.categoryOverlay} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.locationContainer}>
          <Feather name="map-pin" size={50} color="#E5E7EB" />
          <Text style={styles.locationPrompt}>
            Select a location to see results
          </Text>
          <TouchableOpacity
            style={styles.selectLocationButton}
            onPress={handleSearchPress}
          >
            <Text style={styles.selectLocationText}>Select Location</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: {
    width: (width - 24) / 2, // Subtract padding and gap for two columns
    height: 128,
    borderRadius: 8,
    marginBottom: 8,
    marginRight: 8, // Gap between columns
    overflow: "hidden",
    position: "relative",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  categoryText: {
    position: "absolute",
    bottom: 12,
    left: 12,
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  locationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  locationPrompt: {
    color: "#6B7280", // gray-500
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  selectLocationButton: {
    backgroundColor: "#3B82F6", // blue-500
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  selectLocationText: {
    color: "white",
    fontWeight: "500",
  },
});

export default SearchHomeScreen;
