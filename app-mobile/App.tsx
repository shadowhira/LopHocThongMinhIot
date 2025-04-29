// App.tsx
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/services/api";
import "./global.css";
import { RootNavigator } from "@/navigation/RootNavigator";
import { NetworkProvider } from "@/features/auth/context/NetworkContext";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
}
