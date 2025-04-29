"use client"

import React, { useEffect, useState } from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { RootStackNavigationProp } from "../../../navigation/types"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useOtherProfile } from "../hooks/useOtherProfile"
import { spaceService } from "../../../services/firebase/spaceService"
import { Space } from "../../../types/space"
import { interestService } from "../../../services/firebase/interestService"
import { chatService } from "../../../services/firebase/chatService"
import { auth } from "../../../config/firebase"

// Default space images array
const defaultSpaceImages = [
  require("../../../public/assets/communities/1.png"),
  require("../../../public/assets/communities/2.png"),
  require("../../../public/assets/communities/3.png"),
  require("../../../public/assets/communities/4.png")
];


// Mock data for the other user profile
const mockUserData = {
  id: "user-001",
  name: "Anaya Mehra",
  pronouns: "She / Her",
  connections: "500+ Connections",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  headline: "Strategic Marketing Professional | Brand Enthusiast | Driving Success through Creativity & Analytics",
  location: "Mumbai, India",
  workTitle: "Marketing Manager",
  workCompany: "Pixar",
  about: "Passionate and results-driven Strategic Marketing Professional with a keen eye for brand development and a penchant for blending creativity with data-driven insights. Committed to crafting compelling narratives that resonate with target audiences and drive measurable business outcomes.",
  commonInterests: "Both of you share Fitness Folks and Wanderlust in common",
  spaces: [
    {
      id: "space-001",
      name: "Top Contributor",
      club: "1% Club",
      memberSince: "Member since July '22",
      image: require("../../../public/assets/communities/1.png")
    },
    {
      id: "space-002",
      name: "Fitness Folks",
      club: "Fitness Enthusiasts",
      memberSince: "Member since March '23",
      image: require("../../../public/assets/communities/2.png")
    },
    {
      id: "space-003",
      name: "Wanderlust",
      club: "Travel Community",
      memberSince: "Member since January '23",
      image: require("../../../public/assets/communities/3.png")
    }
  ]
};

const DetailOtherUserProfileScreen = () => {
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
    sendConnectionRequest,
    acceptConnectionRequest,
    removeConnection
  } = useOtherProfile(userId);

  // State for user spaces
  const [userSpaces, setUserSpaces] = useState<Space[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  // State for common interests
  const [commonInterests, setCommonInterests] = useState<string>("");
  const [loadingInterests, setLoadingInterests] = useState(true);

  // Fetch user spaces
  useEffect(() => {
    const fetchUserSpaces = async () => {
      if (!userId) {
        setLoadingSpaces(false);
        return;
      }

      try {
        setLoadingSpaces(true);
        const spaces = await spaceService.getSpacesByUser(userId);
        setUserSpaces(spaces || []);
      } catch (error) {
        console.error('Error fetching user spaces:', error);
        // Set empty array on error to avoid undefined
        setUserSpaces([]);
      } finally {
        setLoadingSpaces(false);
      }
    };

    fetchUserSpaces();
  }, [userId]);

  // Fetch common interests
  useEffect(() => {
    const fetchCommonInterests = async () => {
      if (!userId || !profile || !profile.id) {
        setCommonInterests("No common interests information available");
        setLoadingInterests(false);
        return;
      }

      try {
        setLoadingInterests(true);

        // Get current user from auth
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.uid) {
          setCommonInterests("Please log in to see common interests");
          return;
        }

        // Use current user ID instead of profile.id
        const userInterests = await interestService.getUserInterests(userId);
        const myInterests = await interestService.getUserInterests(currentUser.uid);

        // Find common interests
        const common = userInterests.filter(interest =>
          myInterests.some(myInterest => myInterest.id === interest.id)
        );

        if (common.length > 0) {
          const interestNames = common.map(interest => interest.name);
          setCommonInterests(`Both of you share ${interestNames.join(', ')} in common`);
        } else {
          setCommonInterests("You don't have any common interests yet");
        }
      } catch (error) {
        console.error('Error fetching common interests:', error);
        setCommonInterests("Error loading common interests");
      } finally {
        setLoadingInterests(false);
      }
    };

    fetchCommonInterests();
  }, [userId, profile]);

  // Handle connect button press
  const handleConnect = async () => {
    try {
      if (connectionStatus === 'none') {
        await sendConnectionRequest();
        Alert.alert('Success', 'Connection request sent!');
      } else if (connectionStatus === 'pending_received') {
        await acceptConnectionRequest();
        Alert.alert('Success', 'Connection request accepted!');
      } else if (connectionStatus === 'connected') {
        await removeConnection();
        Alert.alert('Success', 'Connection removed!');
      }
    } catch (error) {
      console.error('Error handling connection:', error);
      Alert.alert('Error', 'Failed to process your request. Please try again.');
    }
  };

  // Handle message button press
  const handleMessage = async () => {
    try {
      if (!profile) return;

      const chat = await chatService.getOrCreateChat(profile.id, userId);
      navigation.navigate('Main', {
        screen: 'Home',
        params: {
          screen: 'ChatDetail',
          params: { conversationId: chat.id }
        }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Back button */}
      <TouchableOpacity
        className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md"
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

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
              onPress={() => navigation.replace('DetailOtherUserProfile', { userId })}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Profile Header */}
            <View className="p-4">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: profile?.photoURL || mockUserData.avatar }}
                  className="w-20 h-20 rounded-full"
                />
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-bold">{profile?.displayName || mockUserData.name}</Text>
                  <Text className="text-gray-600">{profile?.pronouns || mockUserData.pronouns}</Text>
                  <Text className="text-gray-600">
                    {profile?.connections ? `${profile.connections.length}+ Connections` : mockUserData.connections}
                  </Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity className="p-2">
                    <Feather name="user-plus" size={24} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2">
                    <Feather name="edit-2" size={24} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2">
                    <Feather name="more-vertical" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Headline */}
            <View className="px-4 mt-2">
              <Text className="text-lg font-bold">Headline</Text>
              <Text className="text-base text-gray-700 mt-1">{profile?.headline || mockUserData.headline}</Text>
            </View>

            {/* Location */}
            <View className="px-4 mt-4 flex-row items-center">
              <Feather name="map-pin" size={20} color="#666" />
              <Text className="ml-2 text-base text-gray-700">{profile?.location || mockUserData.location}</Text>
            </View>

            {/* Work Information */}
            <View className="px-4 mt-4">
              <Text className="text-lg font-bold">Works as</Text>
              <Text className="text-base text-gray-700 mt-1">
                {profile?.workTitle ? `${profile.workTitle}${profile.workCompany ? ` @ ${profile.workCompany}` : ''}` : `${mockUserData.workTitle} @ ${mockUserData.workCompany}`}
              </Text>
            </View>

            {/* Common Interests */}
            <View className="px-4 mt-4 flex-row items-center">
              {loadingInterests ? (
                <ActivityIndicator size="small" color="#0084ff" />
              ) : (
                <>
                  <View className="flex-row">
                    <Image
                      source={{ uri: "https://via.placeholder.com/30" }}
                      className="w-8 h-8 rounded-full"
                    />
                    <Image
                      source={{ uri: "https://via.placeholder.com/30" }}
                      className="w-8 h-8 rounded-full -ml-2"
                    />
                  </View>
                  <Text className="ml-2 text-base text-gray-700">{commonInterests || mockUserData.commonInterests}</Text>
                </>
              )}
            </View>

            {/* About */}
            <View className="px-4 mt-4">
              <Text className="text-lg font-bold">About</Text>
              <Text className="text-base text-gray-700 mt-1">{profile?.about || mockUserData.about}</Text>
            </View>

            {/* Action Buttons */}
            <View className="px-4 mt-6 flex-row justify-between">
              <TouchableOpacity
                className={`${connectionStatus === 'connected' ? 'bg-red-500' : 'bg-blue-500'} rounded-full py-3 px-6 flex-1 mr-2 flex-row items-center justify-center`}
                onPress={handleConnect}
                disabled={processingConnection}
              >
                {processingConnection ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather
                      name={connectionStatus === 'connected' ? "user-minus" : "user-plus"}
                      size={20}
                      color="#fff"
                    />
                    <Text className="text-white font-bold ml-2">
                      {connectionStatus === 'none' && "Connect"}
                      {connectionStatus === 'pending_sent' && "Pending"}
                      {connectionStatus === 'pending_received' && "Accept"}
                      {connectionStatus === 'connected' && "Disconnect"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white border border-blue-500 rounded-full py-3 px-6 flex-1 ml-2 flex-row items-center justify-center"
                onPress={handleMessage}
              >
                <Feather name="message-circle" size={20} color="#0084ff" />
                <Text className="text-blue-500 font-bold ml-2">Message</Text>
              </TouchableOpacity>

              <TouchableOpacity className="ml-2 border border-gray-300 rounded-full p-3">
                <Feather name="more-horizontal" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Spaces */}
            <View className="px-4 mt-6">
              <Text className="text-lg font-bold mb-4">Spaces</Text>
              {loadingSpaces ? (
                <ActivityIndicator size="small" color="#0084ff" />
              ) : userSpaces.length > 0 ? (
                userSpaces.map((space, index) => (
                  <View key={space.id} className="flex-row items-center mb-4">
                    <Image
                      source={space.image ? { uri: space.image } : defaultSpaceImages[index % defaultSpaceImages.length]}
                      style={{ width: 56, height: 56, borderRadius: 28 }}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-medium">{space.name}</Text>
                      <View className="flex-row">
                        <Text className="text-sm text-gray-500">{space.description?.substring(0, 20) || "Community"}</Text>
                        <Text className="text-sm text-gray-500 ml-3">
                          {space.createdAt ? `Member since ${new Date(space.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}` : "Member since Jan '23"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => navigation.navigate('SpaceProfile', { spaceId: space.id })}
                    >
                      <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                mockUserData.spaces.map((space) => (
                  <View key={space.id} className="flex-row items-center mb-4">
                    <Image
                      source={space.image}
                      style={{ width: 56, height: 56, borderRadius: 28 }}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-medium">{space.name}</Text>
                      <View className="flex-row">
                        <Text className="text-sm text-gray-500">{space.club}</Text>
                        <Text className="text-sm text-gray-500 ml-3">{space.memberSince}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => navigation.navigate('SpaceProfile', { spaceId: space.id })}
                    >
                      <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailOtherUserProfileScreen;
