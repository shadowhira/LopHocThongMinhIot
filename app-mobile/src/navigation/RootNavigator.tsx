import { useAuth } from "../features/auth/hooks/useAuth";
import InterestSelectionScreen from "../features/auth/screens/InterestSelectionScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/SignupScreen";
import SplashLoadingScreen from "../features/auth/screens/SplashLoadingScreen";
import SplashScreen from "../features/auth/screens/SplashScreen";
import AboutScreen from "../features/discover/screens/AboutScreen";
import SearchResultsScreen from "../features/discover/screens/SearchResultScreen";
import SpaceProfileScreen from "../features/discover/screens/SpaceProfileScreen";
import OtherUserProfileScreen from "../features/profile/screens/OtherUserProfileScreen";
import DetailOtherUserProfileScreen from "../features/profile/screens/DetailOtherUserProfileScreen";
import SpaceSettingsScreen from "../features/profile/screens/SpaceSettingsScreen";
import { TestScreen } from "../features/test/screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { BottomTabNavigator } from "./BottomTabNavigator";
const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, loading, hasSelectedInterests = false } = useAuth();
  // if (loading) {
  //   return <Stack.Screen name="SplashLoading" component={SplashLoadingScreen} />;
  // }

  const renderScreenDiscover = () => {
    return (
      <>
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="SpaceProfile" component={SpaceProfileScreen} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} />
        <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} />
        <Stack.Screen name="DetailOtherUserProfile" component={DetailOtherUserProfileScreen} />
        <Stack.Screen name="SpaceSettings" component={SpaceSettingsScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
      </>
    );
  }
  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasSelectedInterests ? (
            // If not, show interest selection screen first
            <Stack.Screen
              name="InterestSelection"
              component={InterestSelectionScreen}
            />
          ) : (
            // If they have, show the main app
            <>
              <Stack.Screen name="Main" component={BottomTabNavigator} />
              {renderScreenDiscover()}
            </>
          )}
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="SplashLoading" component={SplashLoadingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
