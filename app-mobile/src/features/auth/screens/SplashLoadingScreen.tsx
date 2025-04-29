"use client";

import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/types";

type SplashLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SplashLoading"
>;

const SplashLoadingScreen = () => {
  const navigation = useNavigation<SplashLoadingScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BFDBFE', // blue-200
  },
});

export default SplashLoadingScreen;