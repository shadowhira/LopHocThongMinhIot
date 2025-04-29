"use client"

import React, { useEffect, useState } from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import Button from "../../../components/ui/Button"
import { RootStackNavigationProp } from "../../../navigation/types"
import { useOtherProfile } from "../hooks/useOtherProfile"
import { userService } from "../../../services/firebase/userService"
import { User } from "../../../types/user"

// Mock data for the other user profile
const mockUserData = {
  id: "user-001",
  name: "Anaya Mehra",
  pronouns: "She / Her",
  connections: "500+ Connections",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  headline: "Strategic Marketing Professional | Brand Enthusiast | Driving Success through Creativity & Analytics",
}

// Mock data for people you may know
const peopleYouMayKnow = [
  {
    id: "user-002",
    name: "Arvind Mishra",
    pronouns: "He / His",
    connections: "500+ Connections",
    headline: "Software Engineer | AI Enthusiast | Transforming Ideas into Reality",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: "user-003",
    name: "Angela Joshi",
    pronouns: "She / Her",
    connections: "500+ Connections",
    headline: "Strategic Marketing Professional | Brand Enthusiast",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: "user-004",
    name: "Suhana Khan",
    pronouns: "She / Her",
    connections: "500+ Connections",
    headline: "Dedicated Healthcare Innovator | Patient Advocate",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: "user-005",
    name: "Max Albino",
    pronouns: "He / His",
    connections: "500+ Connections",
    headline: "Analytical Financial Analyst | Investment Strategist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: "user-006",
    name: "Akshita Sharma",
    pronouns: "She / Her",
    connections: "500+ Connections",
    headline: "Creative Designer | UX Specialist",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: "user-007",
    name: "Chris Froster",
    pronouns: "He / His",
    connections: "500+ Connections",
    headline: "Tech Entrepreneur | Startup Mentor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  }
];

const OtherUserProfileScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const userId = (route.params as { userId?: string })?.userId || mockUserData.id;

  // Use the useOtherProfile hook to get user data and connection status
  const {
    profile,
    loading,
    error,
    connectionStatus,
    processingConnection,
    sendConnectionRequest
  } = useOtherProfile(userId);

  // State for suggested users
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        setLoadingSuggestions(true);
        const users = await userService.getSuggestedUsers(userId, 6);
        setSuggestedUsers(users);
      } catch (error) {
        console.error('Error fetching suggested users:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestedUsers();
  }, [userId]);

  // Function to handle visit profile button press
  const handleVisitProfile = () => {
    navigation.navigate('DetailOtherUserProfile', { userId });
  };

  // Function to handle connect button press
  const handleConnect = async (personId: string) => {
    try {
      await sendConnectionRequest();
      console.log(`Connection request sent to user ${personId}`);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  // Function to navigate to another user's profile
  const navigateToUserProfile = (personId: string) => {
    navigation.navigate('DetailOtherUserProfile', { userId: personId });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Other's Profile</Text>
        <View style={{ width: 40 }} /> {/* Empty view for balance */}
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="p-4 flex items-center justify-center h-40">
            <ActivityIndicator size="large" color="#0084ff" />
            <Text className="mt-2 text-gray-600">Loading profile...</Text>
          </View>
        ) : error ? (
          <View className="p-4 flex items-center justify-center h-40">
            <Feather name="alert-circle" size={24} color="#ff3b30" />
            <Text className="mt-2 text-red-500">Error loading profile</Text>
            <TouchableOpacity
              className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
              onPress={() => navigation.replace('OtherUserProfile', { userId })}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row">
              <Image
                source={{ uri: profile?.photoURL || mockUserData.avatar }}
                className="w-20 h-20 rounded-full"
              />
              <View className="ml-4 flex-1 justify-center">
                <Text className="text-xl font-bold">{profile?.displayName || mockUserData.name}</Text>
                <Text className="text-gray-600">{profile?.pronouns || mockUserData.pronouns}</Text>
                <Text className="text-gray-600">
                  {profile?.connections ? `${profile.connections.length}+ Connections` : mockUserData.connections}
                </Text>
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-800">Headline</Text>
              <Text className="text-sm text-gray-600 mt-1">{profile?.headline || mockUserData.headline}</Text>
            </View>

            <View className="mt-4">
              <Button
                title="Visit Profile"
                variant="primary"
                icon={<Feather name="user" size={16} color="#FFFFFF" />}
                onPress={handleVisitProfile}
                className="w-full"
              />
            </View>
          </View>
        )}

        <View className="p-4">
          <Text className="text-lg font-semibold mb-4">People you may know</Text>

          {loadingSuggestions ? (
            <View className="flex items-center justify-center h-20">
              <ActivityIndicator size="small" color="#0084ff" />
            </View>
          ) : suggestedUsers.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {suggestedUsers.map((person) => (
              <TouchableOpacity
                key={person.id}
                className="w-[48%] border border-gray-200 rounded-lg mb-4 overflow-hidden"
                onPress={() => navigateToUserProfile(person.id)}
              >
                <View className="p-3">
                  <Image
                    source={{ uri: person.photoURL || peopleYouMayKnow[0].avatar }}
                    className="w-16 h-16 rounded-full self-center mb-2"
                  />
                  <Text className="text-center font-semibold">{person.displayName}</Text>
                  <Text className="text-center text-xs text-gray-600">{person.pronouns || 'They/Them'}</Text>
                  <Text className="text-center text-xs text-gray-600">
                    {person.connections ? `${person.connections.length}+ Connections` : '0 Connections'}
                  </Text>

                  <Text className="text-xs text-gray-600 mt-2 text-center" numberOfLines={2}>
                    {person.headline || 'No headline'}
                  </Text>

                  <TouchableOpacity
                    className="mt-3 flex-row items-center justify-center"
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      // Prevent navigation to profile
                      handleConnect(person.id);
                    }}
                  >
                    <Feather name="user-plus" size={16} color="#0084ff" />
                    <Text className="text-blue-500 ml-1 text-sm">Connect</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            </View>
          ) : (
            <View className="flex items-center justify-center h-20">
              <Text className="text-gray-600">No suggested users found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtherUserProfileScreen;
