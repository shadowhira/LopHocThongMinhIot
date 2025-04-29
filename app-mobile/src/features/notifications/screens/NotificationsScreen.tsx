"use client"

import { useState } from "react"
import { View, FlatList, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NotificationIcon } from "@/features/notifications/components/NotificationIcon"
import { NotificationItem } from "@/features/notifications/components/NotificationItem"
import { NotificationTabs } from "@/features/notifications/components/NotificationTabs"
import { Notification } from "@/features/notifications/types"
import { MOCK_NOTIFICATIONS } from "@/features/notifications/data/mockData"



export const NotificationsScreen = () => {
  const [activeTab, setActiveTab] = useState<"all" | "messages" | "reminders">("all")
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const handleTabChange = (tab: "all" | "messages" | "reminders") => {
    setActiveTab(tab)
  }

  const handleNotificationPress = (notification: Notification) => {
    // Đánh dấu thông báo là đã đọc
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    )

    // Xử lý khi nhấn vào thông báo (ví dụ: điều hướng đến màn hình chi tiết)
    console.log("Notification pressed:", notification)
  }

  // Lọc thông báo dựa trên tab đang active
  const filteredNotifications = (notifications ?? []).filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "messages") return notification.type === "message"
    if (activeTab === "reminders") return notification.type === "reminder"
    return true
  })


  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-2 border-b border-gray-200">
        <Text className="text-2xl font-bold">Notification</Text>
      </View>

      <NotificationTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem notification={item} onPress={handleNotificationPress} />}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-lg text-gray-500">No notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

export default NotificationsScreen