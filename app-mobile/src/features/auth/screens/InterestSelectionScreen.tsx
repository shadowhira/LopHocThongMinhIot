"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useNetwork } from "../context/NetworkContext";
import { interestService } from "../services/interestService";
import { authService } from "../services/authService";
import Button from "@/components/ui/Button";

type InterestSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "InterestSelection"
>;

const InterestSelectionScreen = () => {
  const navigation = useNavigation<InterestSelectionScreenNavigationProp>();
  const { user, refetchUser } = useAuth();
  const { isConnected } = useNetwork();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineWarningShown, setOfflineWarningShown] = useState(false);
  const [interestsByCategory, setInterestsByCategory] = useState<
    Record<string, any[]>
  >({});
  const [categories, setCategories] = useState<any[]>([]);

  // Load interests and categories
  useEffect(() => {
    const loadInterests = async () => {
      try {
        setIsLoading(true);

        // Initialize data if needed (this will only create data if it doesn't exist)
        await interestService.initializeInterestData();

        // Get interests grouped by category
        const interestData = await interestService.getInterestsByCategory();
        setInterestsByCategory(interestData);

        // Get categories for ordering
        const categoryData = await interestService.getInterestCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("Error loading interests:", error);
        Alert.alert("Error", "Failed to load interests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, []);

  // Show offline warning once when the component mounts if offline
  useEffect(() => {
    if (!isConnected && !offlineWarningShown) {
      Alert.alert(
        "You are offline",
        "Your selections will be saved locally and synced when you reconnect to the internet.",
        [{ text: "OK", onPress: () => setOfflineWarningShown(true) }],
      );
    }
  }, [isConnected, offlineWarningShown]);

  const toggleInterest = (interest: string): void => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const isInterestSelected = (interest: string): boolean => {
    return selectedInterests.includes(interest);
  };

  const handleAddInterests = async (): Promise<void> => {
    if (selectedInterests.length < 3) {
      Alert.alert("Selection Required", "Please select at least 3 interests");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User not found. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isConnected) {
        // Online - save to Firestore
        try {
          await interestService.saveUserInterests(user.id, selectedInterests);
          console.log("Successfully saved interests to Firestore");
        } catch (error) {
          console.error("Error saving to Firestore, falling back to local storage:", error);
          // If Firestore fails, save locally
          await authService.saveUserInterestsOffline(user.id, selectedInterests);
          Alert.alert(
            "Connection Issue",
            "Your interests have been saved locally and will sync when your connection improves.",
          );
        }
      } else {
        // Offline - save locally
        await authService.saveUserInterestsOffline(user.id, selectedInterests);
        Alert.alert(
          "Saved Offline",
          "Your interests have been saved locally and will sync when you reconnect to the internet.",
        );
      }

      // Refetch user data to update the UI
      refetchUser();

    } catch (error) {
      console.error("Error saving interests:", error);
      Alert.alert(
        "Error",
        isConnected
          ? "Failed to save your interests. Please try again."
          : "Failed to save your interests locally. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async (): Promise<void> => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Mark that the user has completed interest selection (by skipping)
      // but with an empty interests array
      if (isConnected) {
        try {
          await interestService.saveUserInterests(user.id, []);
        } catch (error) {
          console.error("Error saving skip status to Firestore:", error);
          // Save locally as fallback
          await authService.saveUserInterestsOffline(user.id, []);
        }
      } else {
        // If offline, save locally
        await authService.saveUserInterestsOffline(user.id, []);
      }

      // Refetch user data to update the UI
      refetchUser();

    } catch (error) {
      console.error("Error skipping interests:", error);
      // Even if there's an error, still navigate to home
      navigation.replace("Main", { screen: "Home" })
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading interests...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {!isConnected && (
        <View style={styles.offlineWarning}>
          <Feather name="wifi-off" size={16} color="white" />
          <Text style={styles.offlineText}>
            You are offline. Your selections will be saved locally.
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerText}>
          Select at least 3 interests to personalize your feed
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <View style={styles.interestContainer}>
              {interestsByCategory[category.name]?.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestButton,
                    isInterestSelected(interest.name)
                      ? styles.selectedInterestButton
                      : styles.unselectedInterestButton,
                  ]}
                  onPress={() => toggleInterest(interest.name)}
                >
                  <Text
                    style={
                      isInterestSelected(interest.name)
                        ? styles.selectedInterestText
                        : styles.unselectedInterestText
                    }
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isConnected ? "Add" : "Save Offline"}
          onPress={handleAddInterests}
          loading={isSubmitting}
          disabled={selectedInterests.length < 3 || isSubmitting}
          style={styles.addButton}
        />
        <TouchableOpacity onPress={handleSkip} disabled={isSubmitting}>
          <Text
            style={[
              styles.skipText,
              isSubmitting && styles.disabledSkipText,
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563', // gray-600
  },
  offlineWarning: {
    backgroundColor: '#F59E0B', // amber-500
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', // gray-800
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563', // gray-600
    marginBottom: 12,
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  interestButton: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  selectedInterestButton: {
    backgroundColor: '#DBEAFE', // blue-100
    borderWidth: 1,
    borderColor: '#3B82F6', // blue-500
  },
  unselectedInterestButton: {
    backgroundColor: '#F3F4F6', // gray-100
    borderWidth: 1,
    borderColor: '#F3F4F6', // gray-100
  },
  selectedInterestText: {
    color: '#3B82F6', // blue-500
    fontWeight: '500',
  },
  unselectedInterestText: {
    color: '#4B5563', // gray-600
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  addButton: {
    width: '100%',
    marginBottom: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280', // gray-500
  },
  disabledSkipText: {
    opacity: 0.5,
  },
});

export default InterestSelectionScreen;