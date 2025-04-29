"use client"

import React, { useState } from "react"
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

export interface SelectOption {
  label: string
  value: string
}

interface SelectInputProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onValueChange: (value: string) => void
  error?: string
  containerClassName?: string
  selectClassName?: string
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  placeholder = "Select an option",
  options,
  value,
  onValueChange,
  error,
  containerClassName = "",
  selectClassName = "",
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  
  const selectedOption = options.find(option => option.value === value)

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-black text-base font-medium mb-1">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        className={`bg-[#E9EFF2] rounded-lg p-4 flex-row justify-between items-center ${error ? 'border border-red-500' : ''} ${selectClassName}`}
        onPress={() => setModalVisible(true)}
      >
        <Text className={selectedOption ? "text-black" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color="#4B5563" />
      </TouchableOpacity>
      
      {error && (
        <Text className="text-red-500 text-xs mt-1">
          {error}
        </Text>
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-xl p-4 h-1/2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-medium">Select {label?.toLowerCase()}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`p-4 border-b border-gray-100 flex-row justify-between items-center`}
                  onPress={() => {
                    onValueChange(item.value)
                    setModalVisible(false)
                  }}
                >
                  <Text className="text-base">{item.label}</Text>
                  {item.value === value && (
                    <Feather name="check" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default SelectInput
