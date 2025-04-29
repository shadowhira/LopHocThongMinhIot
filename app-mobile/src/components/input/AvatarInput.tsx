"use client"

import React from "react"
import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

interface AvatarInputProps {
  source?: string | null
  onPress: () => void
  size?: number
  containerClassName?: string
}

const AvatarInput: React.FC<AvatarInputProps> = ({
  source,
  onPress,
  size = 120,
  containerClassName = "",
}) => {
  const borderRadius = size / 2

  return (
    <View className={`items-center justify-center ${containerClassName}`}>
      <View>
        {source ? (
          <Image
            source={{ uri: source }}
            style={{
              width: size,
              height: size,
              borderRadius,
            }}
          />
        ) : (
          <View
            style={{
              width: size,
              height: size,
              borderRadius,
              backgroundColor: '#3b82f6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: size / 3, fontWeight: 'bold' }}>
              {"?"}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          className="absolute bottom-0 right-0 bg-[#00BFA6] p-2 rounded-full"
          onPress={onPress}
        >
          <Feather name="edit-2" size={size / 6} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AvatarInput
