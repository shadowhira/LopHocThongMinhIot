import NetInfo from "@react-native-community/netinfo"

// Function to check if the device is connected to the internet
export const isConnected = async (): Promise<boolean> => {
  const state = await NetInfo.fetch()
  return state.isConnected === true
}

// Subscribe to network state changes
export const subscribeToNetworkChanges = (onConnected: () => void, onDisconnected: () => void) => {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      onConnected()
    } else {
      onDisconnected()
    }
  })
}

