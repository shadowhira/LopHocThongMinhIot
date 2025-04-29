import { SafeAreaView } from "react-native-safe-area-context";
import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { type StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigation/types";

// Import dữ liệu từ file mockData.ts
import {
  communities,
  events,
  posts,
  liveRooms,
  recommendedCommunities,
  currentUser,
} from "../data/mockData";

// Import các component tùy chỉnh
import { CommunityCircle } from "../components/CommunityCircle";
import { EventCard } from "../components/EventCard";
import PostCard from "../../post/components/PostCard";
import LiveRoom from "../components/ui/LiveRoom";
import RecommendedCommunity from "../components/RecommendedCommunity";
import AppHeader from "../../../components/ui/AppHeader";

type MainStackParamList = {
  MainTabs: undefined;
  ChatList: undefined;
  Profile?: undefined;
  Test: undefined;
};

export const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader showStylizedTitle={true} stylizedTitle="EduSocial" />

      {/* Test Button */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => navigation.navigate('Test')}
      >
        <Text style={styles.testButtonText}>Firebase Test Screen</Text>
      </TouchableOpacity>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Communities */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3"
        >
          {communities.map((community) => (
            <CommunityCircle
              key={community.id}
              name={community.name}
              image={community.image}
            />
          ))}
        </ScrollView>

        {/* Live Room */}
        <View className="mt-4 px-4">
          {liveRooms.map((room) => (
            <LiveRoom
              key={room.id}
              title={room.title}
              host={{
                name: room.host.name,
                image: { uri: room.host.image },
                description: room.host.description,
              }}
              listeners={room.listeners}
              avatars={room.avatars.map((avatar) => ({ uri: avatar }))}
            />
          ))}
        </View>

        {/* Events */}
        <View className="mt-4 px-4">
          <Text className="text-2xl font-semibold mb-3">Sự kiện</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          >
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                community={event.community}
                image={event.Image}
                date={event.date}
                location={event.location}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recommended Communities */}
        <View className="mt-4 px-4">
          <Text className="text-2xl font-semibold mb-3">Cộng đồng gợi ý</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
            {recommendedCommunities.map((community) => (
              <RecommendedCommunity
                key={community.id}
                id={community.id}
                name={community.name}
                image={community.image}
                members={community.members}
                rating={community.rating}
                activeUsers={community.activeUsers}
                description={community.description}
                isNew={community.isNew}
              />
            ))}
          </ScrollView>
        </View>

        {/* Posts */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onAddComment={(postId, text) => {
              console.log(`Added comment to post ${postId}: ${text}`);
              // Trong thực tế, ở đây sẽ gọi API để thêm bình luận
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
