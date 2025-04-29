"use client"

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Linking, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { useAuth } from "../../auth/hooks/useAuth"
import { useProfile } from "../hooks/useProfile"
import { useStorage } from "../../common/hooks/useStorage"
import { User } from "../../../types/user"
import TextInput from "../../../components/input/TextInput"
import SelectInput from "../../../components/input/SelectInput"
import DateInput from "../../../components/input/DateInput"
import AvatarInput from "../../../components/input/AvatarInput"
import Button from "../../../components/ui/Button"
import { SafeAreaView } from "react-native-safe-area-context"
import * as ImagePicker from 'expo-image-picker'

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Non-binary", value: "non-binary" },
  { label: "Prefer not to say", value: "not-specified" },
]

const pronounOptions = [
  { label: "He/Him", value: "he/him" },
  { label: "She/Her", value: "she/her" },
  { label: "They/Them", value: "they/them" },
  { label: "Other", value: "other" },
]

const EditProfileScreen = () => {
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile()
  const { uploadFile, uploading } = useStorage()

  // Form state
  const [name, setName] = useState("")
  const [gender, setGender] = useState<string>("")
  const [pronouns, setPronouns] = useState<string>("")
  const [birthday, setBirthday] = useState<Date | undefined>(undefined)
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [headline, setHeadline] = useState("")
  const [about, setAbout] = useState("")

  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      setName(profile.displayName || "")
      setGender(profile.gender || "")
      setPronouns(profile.pronouns || "")
      setBirthday(profile.birthday ? new Date(profile.birthday) : undefined)
      setJobTitle(profile.workTitle || "")
      setCompany(profile.workCompany || "")
      setLocation(profile.location || "")
      setHeadline(profile.headline || "")
      setAbout(profile.about || "")
      setAvatarUri(profile.photoURL || null)
    }
  }, [profile])

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Sorry, we need camera and photo library permissions to make this work!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              // On iOS, this will open the Settings app
              // On Android, this doesn't do anything automatically
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:')
              } else {
                Alert.alert(
                  'Permission Settings',
                  'Please go to Settings > Apps > [Your App Name] > Permissions and grant camera and storage permissions.',
                  [{ text: 'OK' }]
                )
              }
            }}
          ]
        )
        return false
      }
      return true
    }
    return true
  }

  const handleAvatarPress = async () => {
    const hasPermissions = await requestPermissions()
    if (!hasPermissions) return

    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage }
      ]
    )
  }

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri)
        // Here you would typically upload the image to your server/storage
        console.log('Photo taken:', result.assets[0].uri)
      }
    } catch (error) {
      console.log('Error taking photo:', error)
      Alert.alert('Error', 'There was an error taking the photo')
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri)
        // Here you would typically upload the image to your server/storage
        console.log('Image selected:', result.assets[0].uri)
      }
    } catch (error) {
      console.log('Error picking image:', error)
      Alert.alert('Error', 'There was an error selecting the image')
    }
  }

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!name.trim()) {
        Alert.alert('Error', 'Name is required');
        return;
      }

      // Validate user is logged in
      if (!user || !user.id) {
        Alert.alert('Error', 'You must be logged in to update your profile');
        return;
      }

      setIsSubmitting(true);

      // Prepare profile data
      const profileData: Partial<User> = {
        displayName: name.trim(),
      };

      // Add optional fields only if they have values
      if (gender) profileData.gender = gender;
      if (pronouns) profileData.pronouns = pronouns;
      if (jobTitle) profileData.workTitle = jobTitle.trim();
      if (company) profileData.workCompany = company.trim();
      if (location) profileData.location = location.trim();
      if (headline) profileData.headline = headline.trim();
      if (about) profileData.about = about.trim();

      // Add birthday only if it has a value
      if (birthday) {
        profileData.birthday = birthday.toISOString();
      }

      // Upload avatar if changed (avatarUri is a local file path)
      if (avatarUri && avatarUri !== profile?.photoURL) {
        try {
          console.log('Attempting to upload avatar:', avatarUri);

          // Validate user ID
          if (!user?.id) {
            throw new Error('User ID is undefined');
          }

          // Create a unique filename with timestamp
          const timestamp = new Date().getTime();
          const storagePath = `users/${user.id}/profile_${timestamp}.jpg`;

          console.log('Storage path:', storagePath);
          const downloadURL = await uploadFile(avatarUri, storagePath, 'image/jpeg');

          console.log('Avatar uploaded successfully, URL:', downloadURL);
          profileData.photoURL = downloadURL;
        } catch (error) {
          console.error('Error uploading avatar:', error);
          Alert.alert(
            'Upload Error',
            'Failed to upload profile picture. Please try again.\n\nError: ' + (error instanceof Error ? error.message : String(error))
          );
          // Continue with profile update even if avatar upload fails
        }
      }

      // Update profile
      await updateProfile(profileData)

      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully",
        [
          { text: "OK", onPress: () => navigation.goBack() }
        ]
      )
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert('Error', 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
        <Text className="text-xl font-semibold text-center flex-1">Edit Profile</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {profileLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading profile...</Text>
        </View>
      ) : profileError ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 mb-4">Error loading profile: {profileError.message}</Text>
          <Button
            title="Retry"
            onPress={() => navigation.replace('EditProfile')}
            className="w-32"
          />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
        <AvatarInput
          source={avatarUri}
          onPress={handleAvatarPress}
          containerClassName="mb-6"
        />

        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <TextInput
          label="Headline"
          value={headline}
          onChangeText={setHeadline}
          placeholder="Enter a professional headline"
        />

        <TextInput
          label="About"
          value={about}
          onChangeText={setAbout}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <SelectInput
              label="Gender"
              options={genderOptions}
              value={gender}
              onValueChange={setGender}
            />
          </View>

          <View className="flex-1">
            <SelectInput
              label="Pronouns"
              options={pronounOptions}
              value={pronouns}
              onValueChange={setPronouns}
            />
          </View>
        </View>

        <DateInput
          label="Birthday"
          value={birthday}
          onValueChange={setBirthday}
          maximumDate={new Date()} // Can't select future dates
        />

        <TextInput
          label="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
          placeholder="Enter your job title"
        />

        <TextInput
          label="Company"
          value={company}
          onChangeText={setCompany}
          placeholder="Enter your company"
        />

        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Enter your location"
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isSubmitting || uploading}
          disabled={isSubmitting || uploading}
          className="mt-6"
        />
      </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default EditProfileScreen
