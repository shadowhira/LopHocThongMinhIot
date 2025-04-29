import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "react-native";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import ViewProfileScreen from "@/features/profile/screens/ViewProfileScreen";
import EditProfileScreen from "@/features/profile/screens/EditProfileScreen";
import NotificationsScreen from "@/features/notifications/screens/NotificationsScreen";
import CalendarScreen from "@/features/calendar/screens/CalendarScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyVaults from "@/features/vaults/screens/MyVaults";
import HomeScreen from "@/features/home/screens/HomeScreen";
import SearchHomeScreen from "@/features/discover/screens/SearchHomeScreen";
import SearchHistoryScreen from "@/features/discover/screens/SearchHistoryScreen";
import ChatListScreen from "@/features/chat/screens/ChatListScreen";
import ChatDetailScreen from "@/features/chat/screens/ChatDetailScreen";
import SearchFilterScreen from "@/features/discover/screens/SearchFilterScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{
          headerShown: false, // Ẩn header mặc định
        }}
      />
    </Stack.Navigator>
  );
}

function DiscoveryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchHome" component={SearchHomeScreen} />
      <Stack.Screen name="SearchHistory" component={SearchHistoryScreen} />
      <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />
    </Stack.Navigator>
  );
}

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;
          switch (route.name) {
            case "Home":
              iconSource = require("@/public/assets/icons/home.png");
              break;
            case "My Vaults":
              iconSource = require("@/public/assets/icons/vaults.png");
              break;
            case "Discover":
              iconSource = require("@/public/assets/icons/discover.png");
              break;
            case "Notifications":
              iconSource = require("@/public/assets/icons/notifications.png");
              break;
            case "Calendar":
              iconSource = require("@/public/assets/icons/calendar.png");
              break;
          }
          return (
            <Image
              source={iconSource}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "blue" : "gray",
              }}
            />
          );
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="My Vaults"
        component={MyVaults}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoveryStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
