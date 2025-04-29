import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { auth } from "../../../config/firebase"
import type { LoginCredentials, RegisterCredentials, User } from "../types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { firestoreService } from "./databaseService";

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      // Check if input is email or username
      const isEmail = email.includes("@")

      if (isEmail) {
        // Login with email
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const { user } = userCredential

        // Try to get additional user data from Firestore
        try {
          const userData = await firestoreService.getUserById(user.uid)

          return {
            id: user.uid,
            email: user.email || "",
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
          }
        } catch (error) {
          // If Firestore fetch fails, return basic user info
          return {
            id: user.uid,
            email: user.email || "",
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
          }
        }
      } else {
        // First, query Firestore to find the user with this username
        const userData = await firestoreService.getUserByEmail(email)

        if (!userData) {
          throw new Error("User not found")
        }

        // Now sign in with email
        const userCredential = await signInWithEmailAndPassword(auth, userData.email, password)
        const { user } = userCredential

        return {
          id: user.uid,
          email: user.email || "",
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },
  
  async register({ email, password, displayName }: RegisterCredentials): Promise<User> {
    try {
      // Check if email already exists (if provided)
      if (email) {
        const existingUser = await firestoreService.getUserByEmail(email)
        if (existingUser) {
          throw new Error("Email already taken")
        }
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const { user } = userCredential

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      // Store additional user data in Firestore
      const userData = {
        email,
        displayName: displayName || null,
        interests: [],
        interestsSelected: false,
      }

      await firestoreService.createUser(user.uid, userData)

      return {
        id: user.uid,
        email: user.email || "",
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },
  
  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  },
  
  getCurrentUser(): User | null {
    const user = auth.currentUser

    if (!user) return null

    return {
      id: user.uid,
      email: user.email || "",
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
    }
  },
  async saveUserInterestsOffline(userId: string, interests: string[]): Promise<void> {
    // Save interests to AsyncStorage
    const userProfileData = {
      interests,
      interestsSelected: true,
      updatedAt: new Date().toISOString(),
      pendingSync: true,
    }

    await AsyncStorage.setItem(`@userProfile_${userId}`, JSON.stringify(userProfileData))

    // Also save to pending sync queue
    const pendingSyncs = (await AsyncStorage.getItem("@pendingSyncs")) || "[]"
    const syncs = JSON.parse(pendingSyncs)
    syncs.push({
      type: "interests",
      userId,
      data: userProfileData,
      timestamp: new Date().toISOString(),
    })
    await AsyncStorage.setItem("@pendingSyncs", JSON.stringify(syncs))
  },
  
  async saveUserLocation(userId: string, location: string): Promise<void> {
    try {
      // Lưu location vào Firestore
      await firestoreService.updateUser(userId, { location })
    } catch (error) {
      console.error("Error saving user location:", error)
      throw error
    }
  },

  async saveUserLocationOffline(userId: string, location: string): Promise<void> {
    // Lấy dữ liệu user profile hiện tại
    const userProfileJson = await AsyncStorage.getItem(`@userProfile_${userId}`)
    const userProfileData = userProfileJson ? JSON.parse(userProfileJson) : {}

    // Cập nhật location
    const updatedProfile = {
      ...userProfileData,
      location,
      updatedAt: new Date().toISOString(),
      pendingSync: true,
    }

    // Lưu vào AsyncStorage
    await AsyncStorage.setItem(`@userProfile_${userId}`, JSON.stringify(updatedProfile))

    // Thêm vào hàng đợi đồng bộ
    const pendingSyncs = (await AsyncStorage.getItem("@pendingSyncs")) || "[]"
    const syncs = JSON.parse(pendingSyncs)
    syncs.push({
      type: "location",
      userId,
      data: { location },
      timestamp: new Date().toISOString(),
    })
    await AsyncStorage.setItem("@pendingSyncs", JSON.stringify(syncs))
  },

};