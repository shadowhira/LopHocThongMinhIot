import type React from "react"
import { View, ScrollView, type StyleProp, type ViewStyle } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface ContainerProps {
  children: React.ReactNode
  scrollable?: boolean
  safeArea?: boolean
  className?: string
  contentContainerClassName?: string
}

const Container: React.FC<ContainerProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  className = "",
  contentContainerClassName = "",
}) => {
  const baseContainerClass = `flex-1 ${className}`
  const baseContentClass = `flex-1 p-6 ${contentContainerClassName}`

  if (safeArea) {
    if (scrollable) {
      return (
        <SafeAreaView className={baseContainerClass}>
          <ScrollView
            className="flex-1"
            contentContainerClassName={baseContentClass}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      )
    }

    return (
      <SafeAreaView className={baseContainerClass}>
        <View className={baseContentClass}>{children}</View>
      </SafeAreaView>
    )
  }

  if (scrollable) {
    return (
      <ScrollView 
        className={baseContainerClass}
        contentContainerClassName={baseContentClass}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <View className={baseContainerClass}>
      <View className={baseContentClass}>{children}</View>
    </View>
  )
}

export default Container