import ContributorCard from "@/features/discover/components/ContributorCard";
import EventCard from "@/features/discover/components/EventCard";
import PostCard from "@/features/discover/components/PostCard";
import ResultCard from "@/features/discover/components/ResultCard";
import ReviewCard from "@/features/discover/components/ReviewCard";
import type { RootStackParamList } from "@/navigation/types";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type SpaceProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SpaceProfile"
>;
const spaceProfileData = {
  id: "space-001",
  title: "CultFit",
  image: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  imageCover: "https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg",
  category: "Fitness",
  reviews: 581,
  isNew: true,
  description:
    "Elevate Your Fitness Goal with Cult.fit | A Space Committed to Fitness, and Personal Growth.",
  isPromoted: true,
  rating: 4.8,
  membersCount: 859,
  events: 62,
  activeUsers: 40,
};
const features = [
  {
    id: "1",
    img : "https://i.imgur.com/UYiroysl.jpg",
    title: "Dancing it out with Hritik Roshan"
  },
  {
    id: "2",
    img : "https://i.imgur.com/UYiroysl.jpg",
    title: "Dancing it out with Hritik Roshan"
  },
  {
    id: "3",
    img : "https://i.imgur.com/UYiroysl.jpg",
    title: "Dancing it out with Hritik Roshan"
  }
]
const posts = [
  {
    id: "1",
    name: "Akash Pandey",
    avatar: "https://i.pravatar.cc/150?img=8",
    description: "Yoga Enthusiast and Meditation Coach",
    time: "2h",
    content:
      "Did you know that the choices we make in the kitchen play a significant role in our overall health? 🌱 Join me on a journ...",
    image: "https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg",
    likes: 53,
    comments: 8
  },
  {
    id: "2",
    name: "Naruto",
    avatar: "https://i.pravatar.cc/150?img=8",
    description: "Yoga Enthusiast and Meditation Coach",
    time: "2h",
    content:
      "Did you know that the choices we make in the kitchen play a significant role in our overall health? 🌱 Join me on a journ...",
    image: "https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg",
    likes: 53,
    comments: 8
  },
  {
    id: "3",
    name: "Sasuke",
    avatar: "https://i.pravatar.cc/150?img=8",
    description: "Yoga Enthusiast and Meditation Coach",
    time: "2h",
    content:
      "Did you know that the choices we make in the kitchen play a significant role in our overall health? 🌱 Join me on a journ...",
    image: "https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg",
    likes: 53,
    comments: 8
  }
];
const events = [
  {
    id: "1",
    thumbnail: "https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg",
    name: "Cult Fit Marathon with Ranveer Singh",
    time: "20 Dec, 23 | Wed | 7:00 to 9:00 AM",
    location: "Pheonix Palledium, Mumbai - 462042"
  },
  {
    id: "2",
    thumbnail: "https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg",
    name: "Cult Fit Marathon with Ranveer Singh",
    time: "20 Dec, 23 | Wed | 7:00 to 9:00 AM",
    location: "Pheonix Palledium, Mumbai - 462042"
  },
  {
    id: "3",
    thumbnail: "https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg",
    name: "Cult Fit Marathon with Ranveer Singh",
    time: "20 Dec, 23 | Wed | 7:00 to 9:00 AM",
    location: "Pheonix Palledium, Mumbai - 462042"
  }
];
const reviews = [
  {
    id: "1",
    avatar: "https://i.pravatar.cc/100?img=1",
    name: "Janvi Purav",
    rating: 4,
    content:
      "The challenges are a blast, and the accountability they bring is fantastic. The only downside is that some of the live workout times don't align with my schedule. Still, the on-demand options make up for it, and I'm seeing great results!",
  },
  {
    id: "2",
    avatar: "https://i.pravatar.cc/100?img=2",
    name: "Alex Johnson",
    rating: 5,
    content:
      "Absolutely love the variety of classes offered. The trainers are top-notch, and I feel motivated every single day!",
  },
  {
    id: "3",
    avatar: "https://i.pravatar.cc/100?img=3",
    name: "Emily Zhang",
    rating: 3,
    content:
      "It’s good overall, but I wish the app UI was a bit more intuitive. That said, I’m enjoying the workouts!",
  },
  {
    id: "4",
    avatar: "https://i.pravatar.cc/100?img=3",
    name: "Emily Zhang",
    rating: 3,
    content:
      "It’s good overall, but I wish the app UI was a bit more intuitive. That said, I’m enjoying the workouts!",
  },
];
const contributors = [
  {
    id: "1",
    name: "Arvind Mishra",
    gender: "He / His",
    connections: "500+ Connections",
    role: "Software Engineer | AI Enthusiast | Transfer Software Engineer | AI Enthusiast | Transfer Software Engineer | AI Enthusiast | Transfer...",
    avatar: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
  {
    id: "2",
    name: "Angela Joshi",
    gender: "She / Her",
    connections: "500+ Connections",
    role: "Strategic Marketing Professional | Brand Software Engineer | AI Enthusiast | Transfer Software Engineer | AI Enthusiast | Transfer...",
    avatar: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
  {
    id: "3",
    name: "Angela Joshi",
    gender: "She / Her",
    connections: "500+ Connections",
    role: "Strategic Marketing Professional | Brand Software Engineer | AI Enthusiast | Transfer Software Engineer | AI Enthusiast | Transfer...",
    avatar: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
  {
    id: "4",
    name: "Angela Joshi",
    gender: "She / Her",
    connections: "500+ Connections",
    role: "Strategic Marketing Professional | Brand Software Engineer | AI Enthusiast | Transfer Software Engineer | AI Enthusiast | Transfer...",
    avatar: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
];
const trendingItems = [
  {
    id: "1",
    title: "AI Developers",
    image: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
    category: "Technology",
    members: 1280,
    isNew: true,
    description: "A community for AI enthusiasts and developers.",
    isPromoted: true,
    rating: 4.8,
    activeUsers: 540,
  },
  {
    id: "2",
    title: "React Native Việt Nam",
    image: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
    category: "Mobile Development",
    members: 850,
    isNew: false,
    description: "Group chia sẻ kiến thức và job React Native.",
    rating: 4.5,
    activeUsers: 300,
  },
  {
    id: "3",
    title: "Design Thinkers",
    image: "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
    category: "Design",
    members: 430,
    isNew: true,
    description: "Design là tư duy, không chỉ là màu sắc.",
    isPromoted: false,
    rating: 4.2,
    activeUsers: 150,
  },
];

const TABS = ["Recent Posts", "Upcoming Events", "Reviews"];
const aboutDesc = "Cult fit is a vibrant and inclusive online fitness hub committed to promoting holistic well-being and fostering a supportive environment for individual on their wellness journey.";
const SpaceProfileScreen = () => {
  const navigation = useNavigation<SpaceProfileScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState("Recent Posts");
  const route = useRoute();
  const spaceId = (route.params as { spaceId?: string })?.spaceId || spaceProfileData.id;

  const handleBackPress = () => {
    navigation.goBack();
  }

  const handleNextScreen = () => {
    navigation.navigate("AboutScreen");
  }

  const handleSettingsPress = () => {
    navigation.navigate("SpaceSettings", { spaceId, spaceName: spaceProfileData.title });
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} className="p-3">
        <View className="">
          <TouchableOpacity onPress={handleBackPress} className="mb-2" >
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          {/* Header Image */}
          <Image
            source={{ uri: spaceProfileData.imageCover }}
            className="w-full h-48"
            resizeMode="cover"
          />

          {/* Logo đè lên ảnh */}
          <View className="items-center -mt-10">
            <View className="w-20 h-20 rounded-full border-2 border-green-600 bg-white justify-center items-center">
              <Image
                source={{
                  uri: spaceProfileData.image,
                }}
                className="w-16 h-16 rounded-full"
              />
            </View>
            {/* Settings button for space */}
            <TouchableOpacity
              className="absolute right-0 top-0 p-2 bg-white rounded-full shadow-md"
              onPress={handleSettingsPress}
            >
              <Feather name="settings" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text className="text-center text-xl font-semibold mt-2">
            {spaceProfileData.title}
          </Text>

          {/* Badge Statistics */}
          <View className="flex-row justify-around mt-4 gap-1">
            <View className="bg-gray-100 px-4 py-2 rounded-xl items-center">
              <Text className="text-sm font-semibold">
                {spaceProfileData.rating} ★
              </Text>
              <Text className="text-xs text-gray-500">
                {spaceProfileData.reviews} reviews
              </Text>
            </View>
            <View className="bg-gray-100 px-4 py-2 rounded-xl items-center">
              <Feather name="users" size={18} color="#000" />
              <Text className="text-xs text-gray-500">
                {spaceProfileData.membersCount} members
              </Text>
            </View>
            <View className="bg-gray-100 px-4 py-2 rounded-xl items-center">
              <Feather name="trending-down" size={18} color="#000" />
              <Text className="text-xs text-gray-500">
                {spaceProfileData.events} events
              </Text>
            </View>
            <View className="bg-gray-100 px-4 py-2 rounded-xl items-center">
              <Text className="text-xs text-gray-500">
                {spaceProfileData.activeUsers}+ daily{"\n"}active users
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-base text-gray-700 mt-4 leading-5">
            {spaceProfileData.description}
          </Text>
          <Text className="text-sm text-gray-700 mt-1">
            {spaceProfileData.membersCount} members including Janhvi Purav and 2
            others you may know
          </Text>

          {/* Featured */}
          <Text className="text-lg font-medium mt-6 mb-6">Featured</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {features.map((item)=> (
              <View key={item?.id} className="w-48 mr-3">
                <Image
                  source={{ uri: item.img }}
                  className="w-full h-28 rounded-xl"
                />
                <Text className="text-sm mt-2">{item.title}</Text>
            </View>
            ))}
          </ScrollView>

          {/* About */}
          <TouchableOpacity onPress={handleNextScreen} className="mb-2 flex-row items-center justify-between mt-6" >
            <Text className="text-lg font-medium">About</Text>
            <Feather name="chevron-right" size={24} color="#000" className="mr-3" />
          </TouchableOpacity>
          <Text className="text-base text-gray-700 mt-3" numberOfLines={2}>
            {aboutDesc}
          </Text>

          {/* Tab post */}
          <View className="flex-row justify-around border-gray-200 mt-6">
            {TABS.map((tab) => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                <Text
                  className={`text-base py-3 ${
                    activeTab === tab ? "font-semibold text-black border-b-2 border-black" : "text-gray-500"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {activeTab === "Recent Posts" && (
            posts.length > 0 ? (
              posts.map((item) => <PostCard key={item.id} post={item} />)
            ) : (
              <Text>Không có bài viết nào</Text>
            )
          )}
          {activeTab === "Upcoming Events" && (
            events.length > 0 ? (
              events.map((item) => <EventCard key={item.id} event={item} />)
            ) : (
              <Text>Không có sự kiện nào</Text>
            )
          )}
          {activeTab === "Reviews" && (
            reviews.length > 0 ? (
              reviews.map((item) => <ReviewCard key={item.id} review={item} />)
            ) : (
              <Text>Không có đánh giá nào</Text>
            )
          )}

          {/* Top contributors */}
          <Text className="text-lg font-medium mt-6 mb-6">Top Contributors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-x-3">
              {contributors.length > 0 ? (
                contributors.map((item) => (
                  <ContributorCard key={item.id} contributor={item} />
                ))
              ) : (
                <Text>Không có Contributors nào</Text>
              )}
            </View>
          </ScrollView>

          {/* People who joined */}
          <Text className="text-lg font-medium mt-6 mb-6">People who joined this are also part of</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingItems.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Join Button */}
      <TouchableOpacity className="absolute bottom-5 left-4 right-4 bg-blue-500 py-4 rounded-xl items-center">
        <Text className="text-white font-semibold text-base">Join</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SpaceProfileScreen;
