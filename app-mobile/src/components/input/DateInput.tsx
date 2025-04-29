"use client"

import React, { useState } from "react"
import { View, Text, TouchableOpacity, Platform } from "react-native"
import { Feather } from "@expo/vector-icons"
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

interface DateInputProps {
  label?: string
  placeholder?: string
  value?: Date
  onValueChange: (date: Date) => void
  error?: string
  containerClassName?: string
  inputClassName?: string
  maximumDate?: Date
  minimumDate?: Date
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  placeholder = "Select date",
  value,
  onValueChange,
  error,
  containerClassName = "",
  inputClassName = "",
  maximumDate,
  minimumDate,
}) => {
  const [show, setShow] = useState(false)

  const onChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || value
    setShow(false) // Always hide after selection for both platforms
    if (selectedDate) {
      onValueChange(currentDate as Date)
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return ""
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-black text-base font-medium mb-1">
          {label}
        </Text>
      )}

      <TouchableOpacity
        className={`bg-[#E9EFF2] rounded-lg p-4 flex-row justify-between items-center ${error ? 'border border-red-500' : ''} ${inputClassName}`}
        onPress={() => setShow(true)}
      >
        <Text className={value ? "text-black" : "text-gray-400"}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Feather name="calendar" size={20} color="#4B5563" />
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-xs mt-1">
          {error}
        </Text>
      )}

      {show && Platform.OS === 'ios' && (
        <View style={{ height: 300 }}>
          <DateTimePicker
            testID="dateTimePicker"
            value={value || new Date()}
            mode="date"
            display="inline"
            onChange={onChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
        </View>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value || new Date()}
          mode="date"
          display="calendar"
          onChange={onChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  )
}

export default DateInput
