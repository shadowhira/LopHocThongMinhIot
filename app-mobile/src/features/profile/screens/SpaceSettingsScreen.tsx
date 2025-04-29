"use client"

import React, { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { RootStackNavigationProp } from "@/navigation/types"

interface VisibilitySettings {
  public: boolean;
  private: boolean;
  members_only: boolean;
}

const SpaceSettingsScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const spaceId = (route.params as { spaceId?: string })?.spaceId || "space-001";
  const spaceName = (route.params as { spaceName?: string })?.spaceName || "Default Space";

  // Initialize with all options available
  const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings>({
    public: true,
    private: false,
    members_only: false
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleToggleMode = (mode: keyof VisibilitySettings) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
    // Implement API call to update space visibility settings
    console.log(`Space ${spaceId} visibility for ${mode} toggled to ${!visibilitySettings[mode]}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Space Visibility Settings</Text>
        <View style={{ width: 40 }}>
          {/* Empty view for balance */}
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-xl font-bold mb-2">{spaceName}</Text>
          <Text className="text-base text-gray-600 mb-6">
            Choose who can see this space on your profile
          </Text>

          {/* Public Mode Section */}
          <TouchableOpacity
            className={`p-4 border rounded-lg mb-4 ${visibilitySettings.public ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onPress={() => handleToggleMode("public")}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold">Public mode</Text>
                <Text className="text-base text-gray-600 mt-1">
                  Visible to anyone who visits your profile.
                </Text>
              </View>
              <View className={`h-6 w-12 rounded-full ${visibilitySettings.public ? "bg-blue-500" : "bg-gray-300"} justify-center`}>
                <View className={`h-5 w-5 rounded-full bg-white ${visibilitySettings.public ? "ml-6" : "ml-1"}`}>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Private Mode Section */}
          <TouchableOpacity
            className={`p-4 border rounded-lg mb-4 ${visibilitySettings.private ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onPress={() => handleToggleMode("private")}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold">Private mode</Text>
                <Text className="text-base text-gray-600 mt-1">
                  Visible to your connects and members of the said community.
                </Text>
              </View>
              <View className={`h-6 w-12 rounded-full ${visibilitySettings.private ? "bg-blue-500" : "bg-gray-300"} justify-center`}>
                <View className={`h-5 w-5 rounded-full bg-white ${visibilitySettings.private ? "ml-6" : "ml-1"}`}>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Members Only Mode Section */}
          <TouchableOpacity
            className={`p-4 border rounded-lg mb-4 ${visibilitySettings.members_only ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onPress={() => handleToggleMode("members_only")}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold">Members only mode</Text>
                <Text className="text-base text-gray-600 mt-1">
                  Visible to only the members of the said community.
                </Text>
              </View>
              <View className={`h-6 w-12 rounded-full ${visibilitySettings.members_only ? "bg-blue-500" : "bg-gray-300"} justify-center`}>
                <View className={`h-5 w-5 rounded-full bg-white ${visibilitySettings.members_only ? "ml-6" : "ml-1"}`}>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button Section */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-blue-500 py-3 rounded-lg items-center"
          onPress={() => {
            // Here you would save the settings to your backend
            console.log('Saving settings:', visibilitySettings);
            handleBackPress();
          }}
        >
          <Text className="text-white font-semibold text-lg">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SpaceSettingsScreen;
