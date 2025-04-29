import AsyncStorage from "@react-native-async-storage/async-storage"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../../config/firebase"
import { isConnected } from "../utils/networkUtils"

// Interface for pending sync items
interface PendingSyncItem {
  type: string
  userId: string
  data: any
  timestamp: string
}

// Sync pending changes when the app comes online
export const syncPendingChanges = async (): Promise<void> => {
  try {
    // Check if we're online
    const connected = await isConnected()
    if (!connected) {
      console.log("Cannot sync: Device is offline")
      return
    }

    // Get pending syncs
    const pendingSyncsJson = await AsyncStorage.getItem("@pendingSyncs")
    if (!pendingSyncsJson) {
      return
    }

    const pendingSyncs: PendingSyncItem[] = JSON.parse(pendingSyncsJson)
    if (pendingSyncs.length === 0) {
      return
    }

    console.log(`Syncing ${pendingSyncs.length} pending changes...`)

    // Process each pending sync
    const failedSyncs: PendingSyncItem[] = []

    for (const syncItem of pendingSyncs) {
      try {
        if (syncItem.type === "interests") {
          // First check if the user document exists
          const userDocRef = doc(db, "users", syncItem.userId)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            // Document exists, update it
            await updateDoc(userDocRef, {
              ...syncItem.data,
              pendingSync: false,
              updatedAt: serverTimestamp(),
            })
          } else {
            // Document doesn't exist, create it
            console.log(`User document ${syncItem.userId} doesn't exist, creating it...`)
            await setDoc(userDocRef, {
              ...syncItem.data,
              pendingSync: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }

          // Update local cache to remove pendingSync flag
          const userProfileJson = await AsyncStorage.getItem(`@userProfile_${syncItem.userId}`)
          if (userProfileJson) {
            const userProfile = JSON.parse(userProfileJson)
            await AsyncStorage.setItem(
              `@userProfile_${syncItem.userId}`,
              JSON.stringify({ ...userProfile, pendingSync: false }),
            )
          }
        }
        // Add other sync types here as needed
      } catch (error) {
        console.error(`Failed to sync item: ${syncItem.type}`, error)
        failedSyncs.push(syncItem)
      }
    }

    // Update pending syncs with only the failed ones
    if (failedSyncs.length > 0) {
      await AsyncStorage.setItem("@pendingSyncs", JSON.stringify(failedSyncs))
    } else {
      await AsyncStorage.removeItem("@pendingSyncs")
    }

    console.log(
      `Sync completed. ${pendingSyncs.length - failedSyncs.length} items synced, ${failedSyncs.length} failed.`,
    )
  } catch (error) {
    console.error("Error during sync process:", error)
  }
}

// Function to clean up invalid sync items
export const cleanupInvalidSyncItems = async (): Promise<void> => {
  try {
    const pendingSyncsJson = await AsyncStorage.getItem("@pendingSyncs")
    if (!pendingSyncsJson) return

    const pendingSyncs: PendingSyncItem[] = JSON.parse(pendingSyncsJson)

    // Filter out items with invalid or empty userIds
    const validSyncs = pendingSyncs.filter(
      (item) => item.userId && typeof item.userId === "string" && item.userId.length > 0,
    )

    if (validSyncs.length !== pendingSyncs.length) {
      console.log(`Removed ${pendingSyncs.length - validSyncs.length} invalid sync items`)
      await AsyncStorage.setItem("@pendingSyncs", JSON.stringify(validSyncs))
    }
  } catch (error) {
    console.error("Error cleaning up invalid sync items:", error)
  }
}

// Initialize sync service
export const initSyncService = () => {
  // Set up a listener for app coming online
  const checkAndSync = async () => {
    const connected = await isConnected()
    if (connected) {
      // First clean up any invalid sync items
      await cleanupInvalidSyncItems()
      // Then try to sync
      syncPendingChanges()
    }
  }

  // Check for pending syncs on startup
  checkAndSync()

  // Return a function that can be called to manually trigger sync
  return {
    sync: syncPendingChanges,
    cleanup: cleanupInvalidSyncItems,
  }
}

