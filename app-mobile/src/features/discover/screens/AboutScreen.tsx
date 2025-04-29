import type { RootStackParamList } from "@/navigation/types";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type AboutScreenScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AboutScreen"
>;

const AboutScreen = () => {
  const navigation = useNavigation<AboutScreenScreenNavigationProp>();
  const handleBackPress = () => {
    navigation.goBack();
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-4">
        <View className="flex-row items-center mb-3 justify-between">
            <Text className="text-2xl font-bold">About</Text>
            <TouchableOpacity onPress={handleBackPress} className="mr-6">
                <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
        </View>

        <Text className="text-base text-gray-700 mb-4">
          Cult fit is a vibrant and inclusive online fitness hub committed to promoting holistic well-being and fostering a supportive environment for individual on their wellness journey.
        </Text>

        <Text className="mb-3 text-base text-gray-800 leading-6">
          🤝 <Text className="font-semibold">Join the Movement:</Text> Connect with like-minded individuals who share your passion for a healthy lifestyle. Cult.fit is more than just a fitness platform; it’s a community-driven space where members motivate and inspire each other to achieve their fitness goals.
        </Text>

        <Text className="mb-3 text-base text-gray-800 leading-6">
          ✨ <Text className="font-semibold">Expert Guidance:</Text> Benefit from expert guidance provided by certified fitness trainers and nutritionists. Cult.fit is dedicated to delivering quality content and personalized support to empower you on your path to optimal health.
        </Text>

        <Text className="mb-3 text-base text-gray-800 leading-6">
          📲 <Text className="font-semibold">Anytime, Anywhere:</Text> Access your fitness community from the comfort of your home or on the go. Our online platform transcends geographical boundaries, bringing together individuals from diverse backgrounds united by a common commitment to wellness.
        </Text>

        <Text className="mb-3 text-base text-gray-800 leading-6">
          🔗 <Text className="font-semibold">Let’s Connect:</Text> Cult.fit is not just about workouts; it’s about building connections. Together, let’s cultivate a culture of fitness and well-being.
        </Text>

        <View className="mt-4">
          <Text className="text-base font-semibold">Private</Text>
          <Text className="text-sm text-gray-600">Only members can see the posts.</Text>
        </View>

        <View className="mt-4">
          <Text className="text-base font-semibold">Listed</Text>
          <Text className="text-sm text-gray-600">
            This group appears on search results and is visible to people on members’ profile.
          </Text>
        </View>

        <View className="flex-row items-center mt-6">
            <Image
                source={{ uri: "https://i.pravatar.cc/150?img=3" }} // Thay bằng ảnh thật nếu có
                className="w-12 h-12 rounded-full mr-3"
            />
            <View>
                <Text className="text-base font-medium text-black">Manish Kukreja</Text>
                <Text className="text-sm text-gray-500">Jan, 2023</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
