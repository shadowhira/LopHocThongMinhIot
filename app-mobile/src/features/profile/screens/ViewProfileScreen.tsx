import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "../../../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../hooks/useProfile";
import { useSpaces } from "../../spaces/hooks/useSpaces";

// Mảng hình ảnh mặc định cho spaces
const defaultSpaceImages = [
  require("../../../public/assets/communities/1.png"),
  require("../../../public/assets/communities/2.png"),
  require("../../../public/assets/communities/3.png"),
  require("../../../public/assets/communities/4.png")
];

const ViewProfileScreen = () => {
  const { profile, loading: profileLoading, error } = useProfile();
  const { spaces, loading: spacesLoading } = useSpaces();
  const navigation = useNavigation<RootStackNavigationProp>();

  const loading = profileLoading || spacesLoading;

  // Lọc spaces của user hiện tại
  const userSpaces = spaces.filter(space => space.createdBy === profile?.id);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <View className="flex flex-1 p-4 bg-white gap-[16px] pt-[24px]">
        {loading ? (
          <View className="flex items-center justify-center h-40">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : error ? (
          <View className="flex items-center justify-center h-40">
            <Text className="text-red-500">Error loading profile: {error.message}</Text>
            <TouchableOpacity
              className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
              onPress={() => navigation.replace('ViewProfile')}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="flex flex-row">
              <View className="flex flex-row items-center gap-[16px]">
                {profile?.photoURL ? (
                  <Image
                    source={{ uri: profile.photoURL }}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      borderWidth: 2,
                      borderColor: "white",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: "#3b82f6",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                    >
                      {(
                        profile?.displayName?.substring(0, 2) ||
                        profile?.email?.substring(0, 2) ||
                        "U"
                      ).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="flex flex-col">
                  <Text className="text-[20px] font-normal">
                    {profile?.displayName || "No Name"}
                  </Text>
                  <Text className="text-[14px] font-normal">{profile?.pronouns || "She / Her"}</Text>
                  <Text className="text-[14px] text-[#000000B2] font-normal">
                    {profile?.connections ? `${profile.connections.length}+ Connections` : "500+ Connections"}
                  </Text>
                </View>
              </View>
          <View className="flex flex-row gap-[8px] flex-grow justify-end items-start">
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Image
                style={{ height: 24, width: 24 }}
                source={require("@/public/assets/profile-screen/edit.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                style={{ height: 24, width: 24 }}
                source={require("@/public/assets/profile-screen/more.png")}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex flex-col gap-[4px]">
          <Text className="text-[20px] font-normal">Headline</Text>
          <Text className="text-[16px] text-[#000000BF] font-normal">
            {profile?.headline || "UX Designer | Crafting Intuitive Experiences for Seamless User Journeys | Bridging Design and Functionality for Digital Excellence 🎨💻"}
          </Text>
        </View>

        <View className="flex flex-row gap-[7px]">
          <Image
            style={{ height: 16, width: 16 }}
            source={require("../../../public/assets/profile-screen/map-pin.png")}
          />
          <Text className="text-[14px] text-[#000000B2] font-normal">
            {profile?.location || "Mumbai, India"}
          </Text>
        </View>

        <View className="flex flex-col gap-[4px]">
          <Text className="text-[20px] font-normal">Work as</Text>
          <Text className="text-[14px] text-[#000000BF] font-normal">
            {profile?.workTitle ? `${profile.workTitle}${profile.workCompany ? ` @ ${profile.workCompany}` : ''}` : "Product Designer @ Apple"}
          </Text>
        </View>

        <View className="flex flex-col gap-[8px]">
          <Text className="text-[20px] font-normal">Spaces Joined</Text>

          {spacesLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : userSpaces.length > 0 ? (
            userSpaces.map((space, index) => (
              <TouchableOpacity
                key={space.id}
                className="flex flex-row gap-[8px] items-center mt-2"
                onPress={() => navigation.navigate('SpaceProfile', { spaceId: space.id })}
              >
                <Image
                  style={{ height: 56, width: 56 }}
                  source={space.image ? { uri: space.image } : defaultSpaceImages[index % defaultSpaceImages.length]}
                />
                <View>
                  <Text className="text-[16px] font-normal">
                    {space.name}
                  </Text>
                  <View className="flex flex-row gap-[12px]">
                    <Text className="text-[14px] text-[#00000080] font-normal">
                      {space.description?.substring(0, 20) || "Community"}
                    </Text>
                    <Text className="text-[14px] text-[#00000080] font-normal">
                      {space.createdAt ? `Member since ${new Date(space.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}` : "Member since July'22"}
                    </Text>
                  </View>
                </View>
                <View className="flex justify-end flex-row flex-grow">
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('SpaceSettings', {
                        spaceId: space.id,
                        spaceName: space.name
                      });
                    }}
                  >
                    <Image
                      style={{ height: 24, width: 24 }}
                      source={require("../../../public/assets/profile-screen/setting.png")}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <>
              {/* Fallback to mock data if no spaces are found */}
              <TouchableOpacity
                className="flex flex-row gap-[8px] items-center mt-2"
                onPress={() => navigation.navigate('SpaceProfile', { spaceId: 'space-001' })}
              >
                <Image
                  style={{ height: 56, width: 56 }}
                  source={require("../../../public/assets/communities/1.png")}
                />
                <View>
                  <Text className="text-[16px] font-normal">
                    Writer of the Month
                  </Text>
                  <View className="flex flex-row gap-[12px]">
                    <Text className="text-[14px] text-[#00000080] font-normal">
                      UX Rescues
                    </Text>
                    <Text className="text-[14px] text-[#00000080] font-normal">
                      Member since July'22
                    </Text>
                  </View>
                </View>
                <View className="flex justify-end flex-row flex-grow">
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('SpaceSettings', {
                        spaceId: 'space-001',
                        spaceName: 'Writer of the Month'
                      });
                    }}
                  >
                    <Image
                      style={{ height: 24, width: 24 }}
                      source={require("../../../public/assets/profile-screen/setting.png")}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </>
    )}
      </View>
    </SafeAreaView>
  );
};

export default ViewProfileScreen;
