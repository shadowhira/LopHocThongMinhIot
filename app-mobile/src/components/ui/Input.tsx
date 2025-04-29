"use client"

import type React from "react"
import { useState } from "react"
import { View, TextInput, Text, TouchableOpacity, type TextInputProps } from "react-native"
import { Feather } from "@expo/vector-icons"

interface InputProps extends TextInputProps {
  label: string
  error?: string
  icon?: keyof typeof Feather.glyphMap
  isPassword?: boolean
}

const Input: React.FC<InputProps> = ({ label, error, icon, isPassword = false, style, ...props }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className="mb-4">
      <Text className="text-gray-700 mb-1">{label}</Text>
      <View 
        className={`flex-row items-center border border-gray-300 rounded-lg px-3 py-2 ${
          error ? 'border-red-500' : ''
        }`}
      >
        {icon && <Feather name={icon} size={20} color="#9ca3af" />}
        <TextInput 
          className="flex-1 ml-2 text-gray-800"
          secureTextEntry={isPassword && !showPassword} 
          style={style}
          {...props} 
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather 
              name={showPassword ? "eye-off" : "eye"} 
              size={20} 
              color="#9ca3af" 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  )
}

export default Input