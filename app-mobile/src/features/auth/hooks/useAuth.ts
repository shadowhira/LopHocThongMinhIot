"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authService } from "../services/authService"
import type { User, LoginCredentials, RegisterCredentials } from "../types"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import {
  db,
  isFirestoreNetworkEnabled,
  canMakeFirestoreRequests,
  reinitializeFirestore,
} from "../../../config/firebase"
import { Alert } from "react-native"
import { useNetwork } from "../context/NetworkContext"
import { cleanupInvalidSyncItems } from "../services/syncService"

export const useAuth = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<Error | null>(null)
  const { isConnected } = useNetwork()
  const [isManuallyLoading, setIsManuallyLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  // Function to safely get data from Firestore with offline handling
  const safeFirestoreGet = async (docRef: any, retryCount = 0) => {
    if (!isConnected) {
      console.log("Device is offline, cannot make Firestore request")
      throw new Error("OFFLINE")
    }

    if (!isFirestoreNetworkEnabled()) {
      console.log("Firestore network is disabled, cannot make request")
      throw new Error("OFFLINE")
    }

    if (!canMakeFirestoreRequests()) {
      console.log("Firestore is not ready for requests yet")

      if (retryCount < maxRetries) {
        console.log(`Retrying Firestore request (${retryCount + 1}/${maxRetries})...`)
        // Wait with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        return safeFirestoreGet(docRef, retryCount + 1)
      }

      throw new Error("OFFLINE")
    }

    try {
      return await getDoc(docRef)
    } catch (err: any) {
      console.log("Firestore request failed:", err.message || err.code || err)

      // Check if the error is related to being offline
      if (
        err.message?.includes("offline") ||
        err.message?.includes("network") ||
        err.code === "unavailable" ||
        err.code === "failed-precondition"
      ) {
        console.log("Firestore operation failed due to network issue:", err.message || err.code)

        if (retryCount < maxRetries) {
          console.log(`Retrying Firestore request after network error (${retryCount + 1}/${maxRetries})...`)

          // If this is the first retry, try resetting the network connection
          if (retryCount === 0) {
            try {
              await reinitializeFirestore()
              // Wait a bit after reinitializing
              await new Promise((resolve) => setTimeout(resolve, 2000))
            } catch (reinitErr) {
              console.error("Error resetting Firestore network during retry:", reinitErr)
            }
          }

          // Wait with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          return safeFirestoreGet(docRef, retryCount + 1)
        }

        throw new Error("OFFLINE")
      }

      throw err
    }
  }

  // Query to get the current user
  const {
    data: user,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        // First check AsyncStorage
        const storedUser = await AsyncStorage.getItem("@user")
        if (storedUser) {
          return JSON.parse(storedUser) as User
        }

        // Then check Firebase auth state
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          await AsyncStorage.setItem("@user", JSON.stringify(currentUser))
          return currentUser
        }

        return null
      } catch (err) {
        console.error("Error fetching user:", err)
        return null
      }
    },
    staleTime: Number.POSITIVE_INFINITY, // Don't refetch automatically
    retry: 2, // Retry failed requests up to 2 times
  })

  // Query to get user's profile data including interests
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    refetch: refetchUserProfile,
    isFetching: isFetchingProfile,
  } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      try {
        // First check if we have cached profile data
        const cachedProfile = await AsyncStorage.getItem(`@userProfile_${user.id}`)
        let profile = cachedProfile ? JSON.parse(cachedProfile) : null

        // If online, try to get fresh data from Firestore
        if (isConnected) {
          try {
            const docRef = doc(db, "users", user.id)

            // Use our safe Firestore getter with retry logic
            const docSnap = await safeFirestoreGet(docRef)

            if (docSnap.exists()) {
              profile = docSnap.data()
              // Cache the fresh data
              await AsyncStorage.setItem(`@userProfile_${user.id}`, JSON.stringify(profile))
              console.log("Successfully fetched and cached user profile")
              retryCountRef.current = 0 // Reset retry count on success
            }
          } catch (err: any) {
            if (err.message === "OFFLINE") {
              console.log("Device is offline or Firestore is unavailable, using cached profile data")
            } else {
              console.warn("Error fetching user profile from Firestore:", err.message || err)
            }

            // If we have cached data, use it even if Firestore fetch fails
            if (!profile && err.message !== "OFFLINE") {
              throw err
            }
          }
        } else if (!profile) {
          // If offline and no cached data, return null but don't throw
          console.log("Offline with no cached profile data")
          return null
        }

        return profile
      } catch (err) {
        console.error("Error fetching user profile:", err)
        // Return null instead of throwing to prevent UI errors
        return null
      }
    },
    enabled: !!user?.id,
    retry: isConnected ? 2 : 0, // Only retry if connected
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  })

  // Refetch profile when connection is restored
  useEffect(() => {
    if (isConnected && user?.id) {
      console.log("Connection restored, refetching user profile")

      // Add a delay before refetching to ensure Firestore is ready
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setIsManuallyLoading(true)

      timeoutRef.current = setTimeout(() => {
        refetchUserProfile().finally(() => {
          setIsManuallyLoading(false)
        })
      }, 5000) // Wait 5 seconds before trying to refetch
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isConnected, user?.id, refetchUserProfile])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      if (!isConnected) {
        throw new Error("Cannot login while offline")
      }
      setIsManuallyLoading(true)
      return authService.login(credentials)
    },
    onSuccess: async (userData) => {
      await AsyncStorage.setItem("@user", JSON.stringify(userData))
      queryClient.setQueryData(["user"], userData)

      // Invalidate userProfile query to refetch
      queryClient.invalidateQueries({ queryKey: ["userProfile", userData.id] })

      setError(null)
      setIsManuallyLoading(false)

      // Clean up any invalid sync items
      cleanupInvalidSyncItems()
    },
    onError: (err: Error) => {
      setError(err)
      console.error("Login error:", err)
      Alert.alert(
        "Login Failed",
        isConnected
          ? err.message || "Please check your credentials and try again."
          : "You are offline. Please connect to the internet and try again.",
      )
      setIsManuallyLoading(false)
    },
  })

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => {
      if (!isConnected) {
        throw new Error("Cannot sign up while offline")
      }
      setIsManuallyLoading(true)
      return authService.register(credentials)
    },
    onSuccess: async (userData) => {
      await AsyncStorage.setItem("@user", JSON.stringify(userData))
      queryClient.setQueryData(["user"], userData)

      // Invalidate userProfile query to refetch
      queryClient.invalidateQueries({ queryKey: ["userProfile", userData.id] })

      setError(null)
      setIsManuallyLoading(false)

      // Clean up any invalid sync items
      cleanupInvalidSyncItems()
    },
    onError: (err: Error) => {
      setError(err)
      console.error("Signup error:", err)
      Alert.alert(
        "Signup Failed",
        isConnected
          ? err.message || "Please check your information and try again."
          : "You are offline. Please connect to the internet and try again.",
      )
      setIsManuallyLoading(false)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      setIsManuallyLoading(true)
      return authService.signOut()
    },
    onSuccess: async () => {
      await AsyncStorage.removeItem("@user")
      // Also remove cached profile data
      if (user?.id) {
        await AsyncStorage.removeItem(`@userProfile_${user.id}`)
      }
      queryClient.setQueryData(["user"], null)
      queryClient.removeQueries({ queryKey: ["userProfile"] })
      setError(null)
      setIsManuallyLoading(false)

      // Clean up any invalid sync items
      cleanupInvalidSyncItems()
    },
    onError: (err: Error) => {
      setError(err)
      console.error("Logout error:", err)
      Alert.alert("Logout Failed", "Please try again.")
      setIsManuallyLoading(false)
    },
  })

  const clearError = () => setError(null)

    // Thêm hàm saveUserLocation sau hàm clearError
    const saveUserLocation = async (location: string) => {
      if (!user?.id) return
  
      try {
        setIsManuallyLoading(true)
  
        // Cập nhật location trong Firestore nếu online
        if (isConnected) {
          try {
            const userDocRef = doc(db, "users", user.id)
            await updateDoc(userDocRef, {
              location,
              updatedAt: serverTimestamp(),
            })
  
            // Cập nhật user trong state
            queryClient.setQueryData(["user"], {
              ...user,
              location,
            })
  
            // Cập nhật AsyncStorage
            const storedUser = await AsyncStorage.getItem("@user")
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser)
              await AsyncStorage.setItem(
                "@user",
                JSON.stringify({
                  ...parsedUser,
                  location,
                }),
              )
            }
          } catch (error) {
            console.error("Error saving location to Firestore:", error)
            // Lưu vào local storage nếu có lỗi với Firestore
            await saveUserLocationLocal(location)
          }
        } else {
          // Lưu vào local storage nếu offline
          await saveUserLocationLocal(location)
        }
      } catch (error) {
        console.error("Error saving user location:", error)
      } finally {
        setIsManuallyLoading(false)
      }
    }
  
    // Thêm hàm saveUserLocationLocal
    const saveUserLocationLocal = async (location: string) => {
      if (!user?.id) return
  
      try {
        // Cập nhật user trong AsyncStorage
        const storedUser = await AsyncStorage.getItem("@user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          await AsyncStorage.setItem(
            "@user",
            JSON.stringify({
              ...parsedUser,
              location,
            }),
          )
  
          // Cập nhật user trong state
          queryClient.setQueryData(["user"], {
            ...user,
            location,
          })
        }
  
        // Thêm vào queue để đồng bộ sau
        const syncQueueKey = `@locationSyncQueue_${user.id}`
        const queueJson = await AsyncStorage.getItem(syncQueueKey)
        const queue = queueJson ? JSON.parse(queueJson) : []
  
        queue.push({
          location,
          timestamp: Date.now(),
        })
  
        await AsyncStorage.setItem(syncQueueKey, JSON.stringify(queue))
      } catch (error) {
        console.error("Error saving location to local storage:", error)
      }
    }

  const hasSelectedInterests = userProfile?.interestsSelected === true

  
  const updateUserProfileMutation = useMutation({
    mutationFn: async (updates: Partial<any>) => {
      if (!user?.id) throw new Error("No user logged in")
      
      // Update Firestore if online
      if (isConnected) {
        const userRef = doc(db, "users", user.id)
        await updateDoc(userRef, updates)
      }
      
      // Update local cache regardless of online status
      const cachedProfile = await AsyncStorage.getItem(`@userProfile_${user.id}`)
      const currentProfile = cachedProfile ? JSON.parse(cachedProfile) : {}
      const updatedProfile = { ...currentProfile, ...updates }
      await AsyncStorage.setItem(`@userProfile_${user.id}`, JSON.stringify(updatedProfile))
      
      // Update React Query cache
      queryClient.setQueryData(["userProfile", user.id], updatedProfile)
      
      return updatedProfile
    },
    onError: (err: Error) => {
      console.error("Error updating user profile:", err)
      Alert.alert("Update Failed", "Failed to update your profile. Please try again.")
    }
  })

  // Memoize the refetchUser function to avoid unnecessary re-renders
  const memoizedRefetchUser = useCallback(() => {
    setIsManuallyLoading(true)
    refetchUser().then(() => {
      if (user?.id) {
        refetchUserProfile().finally(() => {
          setIsManuallyLoading(false)
        })
      } else {
        setIsManuallyLoading(false)
      }
    })
  }, [refetchUser, refetchUserProfile, user?.id])

  // Determine if we're in a loading state
  const isLoading =
    isLoadingUser ||
    isLoadingProfile ||
    isFetchingProfile ||
    loginMutation.isPending ||
    signupMutation.isPending ||
    logoutMutation.isPending ||
    isManuallyLoading

  return {
    user,
    userProfile,
    hasSelectedInterests,
    isOffline: !isConnected,
    loading: isLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    updateUserProfile: updateUserProfileMutation.mutate,
    error,
    clearError,
    refetchUser: memoizedRefetchUser,
    saveUserLocation,
  }
}

