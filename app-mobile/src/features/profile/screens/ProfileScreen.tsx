import React from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import Button from '@/components/ui/Button';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../../navigation/types';



const ProfileScreen = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error } = useProfile();
  const navigation = useNavigation<RootStackNavigationProp>();

  const loading = authLoading || profileLoading;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex flex-1 p-4 bg-white">
        <View className='flex items-center justify-center mt-[56px]'>
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <>
              {profile?.photoURL ? (
                <Image
                  source={{ uri: profile.photoURL }}
                  style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'white' }}
                />
              ) : (
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                    {(profile?.displayName?.substring(0, 2) || profile?.email?.substring(0, 2) || 'U').toUpperCase()}
                  </Text>
                </View>
              )}
              <Text className="text-[16px] font-normal mt-2">
                {profile?.displayName || 'No Name'}
              </Text>
              {profile?.headline && (
                <Text className="text-[14px] text-gray-500 mt-1">
                  {profile.headline}
                </Text>
              )}
            </>
          )}
          <Button
            title="View Profile"
            onPress={() => navigation.navigate("ViewProfile")}
            variant="outline"
            size="sm"
            className="mt-2 rounded-lg"
          />
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: "#0000001A",
            marginVertical: 16,
            width: "100%",
          }}
        />

        <View className="ml-4">
          {["Create Community", "My Connections", "Interests"].map(
            (item, index) => (
              <Text
                key={index}
                className="text-[16px] mb-4"
                style={{ color: "#000" }}
                onPress={() => {
                  if (item === "My Connections") {
                    navigation.navigate("OtherUserProfile", {
                      userId: "user-001",
                    });
                  }
                }}
              >
                {item}
              </Text>
            )
          )}
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: "#0000001A",
            marginVertical: 16,
            width: "100%",
          }}
        />

        <View className="ml-4">
          {["Manage Account", "Settings", "Support"].map((item, index) => (
            <Text
              key={index}
              className="text-[16px] mb-4"
              style={{ color: "#000" }}
              onPress={() => {
                if (item === "Settings") {
                  navigation.navigate("Settings");
                }
              }}
            >
              {item}
            </Text>
          ))}
        </View>

        <Button
          title="Logout"
          onPress={() => logout()}
          className="self-center w-[90%] mt-6 mb-6"
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
