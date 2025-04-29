"use client"

import React from "react"
import { View, TextInput as RNTextInput, Text, StyleSheet, TextInputProps as RNTextInputProps } from "react-native"

export interface TextInputProps extends RNTextInputProps {
  label?: string
  error?: string
  containerClassName?: string
  inputClassName?: string
  labelClassName?: string
  errorClassName?: string
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  errorClassName = "",
  ...props
}) => {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className={`text-black text-base font-medium mb-1 ${labelClassName}`}>
          {label}
        </Text>
      )}
      <RNTextInput
        className={`bg-[#E9EFF2] rounded-lg p-4 text-base ${error ? 'border border-red-500' : ''} ${inputClassName}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className={`text-red-500 text-xs mt-1 ${errorClassName}`}>
          {error}
        </Text>
      )}
    </View>
  )
}

export default TextInput
