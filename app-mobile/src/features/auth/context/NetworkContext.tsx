"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import NetInfo from "@react-native-community/netinfo"
import { disableFirestoreNetwork, enableFirestoreNetwork, reinitializeFirestore } from "../../../config/firebase"

interface NetworkContextType {
  isConnected: boolean
  isOfflineMode: boolean
  setOfflineMode: (value: boolean) => void
  lastOnlineTimestamp: number | null
  resetConnection: () => Promise<void>
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isNetworkConnected, setIsNetworkConnected] = useState<boolean>(true)
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false)
  const [lastOnlineTimestamp, setLastOnlineTimestamp] = useState<number | null>(Date.now())
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [isUpdatingNetwork, setIsUpdatingNetwork] = useState<boolean>(false)
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0)

  // Handle network state changes
  const handleNetworkChange = async (isConnected: boolean) => {
    if (isUpdatingNetwork) return // Prevent concurrent updates

    setIsUpdatingNetwork(true)
    console.log(`Network status changed: ${isConnected ? "online" : "offline"}`)

    try {
      if (isConnected) {
        // We're online now
        setLastOnlineTimestamp(Date.now())

        // Only enable Firestore network if we're not in forced offline mode
        if (!isOfflineMode) {
          await enableFirestoreNetwork()
          setConsecutiveFailures(0) // Reset failure count on successful connection
        }
      } else {
        // We're offline now
        await disableFirestoreNetwork()
      }

      setIsNetworkConnected(isConnected)
    } catch (error) {
      console.error("Error handling network change:", error)

      // Track consecutive failures
      if (isConnected) {
        setConsecutiveFailures((prev) => prev + 1)

        // If we've had multiple consecutive failures, try resetting the network connection
        if (consecutiveFailures >= 2) {
          console.log("Multiple consecutive network handling failures, resetting Firestore network...")
          try {
            await reinitializeFirestore()
            setConsecutiveFailures(0) // Reset on successful reset
          } catch (resetError) {
            console.error("Error resetting Firestore network after consecutive failures:", resetError)
          }
        }
      }
    } finally {
      setIsUpdatingNetwork(false)
    }
  }

  // Initialize network monitoring
  useEffect(() => {
    // Check initial connection state
    const initializeNetworkMonitoring = async () => {
      try {
        const state = await NetInfo.fetch()
        await handleNetworkChange(state.isConnected === true)
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing network monitoring:", error)
        setIsInitialized(true) // Still mark as initialized to prevent blocking the app
      }
    }

    initializeNetworkMonitoring()

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleNetworkChange(state.isConnected === true)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Handle manual offline mode changes
  useEffect(() => {
    if (!isInitialized || isUpdatingNetwork) return

    const updateFirestoreNetwork = async () => {
      setIsUpdatingNetwork(true)
      try {
        if (isOfflineMode) {
          await disableFirestoreNetwork()
        } else if (isNetworkConnected) {
          await enableFirestoreNetwork()
        }
      } catch (error) {
        console.error("Error updating Firestore network for offline mode:", error)
      } finally {
        setIsUpdatingNetwork(false)
      }
    }

    updateFirestoreNetwork()
  }, [isOfflineMode, isNetworkConnected, isInitialized, isUpdatingNetwork])

  // Function to manually reset connection
  const resetConnection = async () => {
    console.log("Manually resetting connection...")
    setIsUpdatingNetwork(true)

    try {
      await reinitializeFirestore()
      console.log("Connection reset complete")
      setConsecutiveFailures(0)
    } catch (error) {
      console.error("Error resetting connection:", error)
    } finally {
      setIsUpdatingNetwork(false)
    }
  }

  const value = {
    isConnected: isNetworkConnected && !isOfflineMode,
    isOfflineMode,
    setOfflineMode: (value: boolean) => setIsOfflineMode(value),
    lastOnlineTimestamp,
    resetConnection,
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}

