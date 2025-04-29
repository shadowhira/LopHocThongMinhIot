import type React from "react"
import { View, TouchableOpacity, Text } from "react-native"
import { Feather } from "@expo/vector-icons"

interface CheckboxProps {
  label: string
  checked: boolean
  onToggle: () => void
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onToggle }) => {
  return (
    <TouchableOpacity 
      className="flex-row items-center"
      onPress={onToggle}
    >
      <View 
        className={`
          w-5 h-5 
          border border-blue-700 
          rounded 
          mr-2 
          items-center justify-center
          ${checked ? 'bg-blue-500' : ''}
        `}
      >
        {checked && <Feather name="check" size={14} color="white" />}
      </View>
      <Text className="text-gray-600">{label}</Text>
    </TouchableOpacity>
  )
}

export default Checkbox