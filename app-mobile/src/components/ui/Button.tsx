import { useNetwork } from "@/features/auth/context/NetworkContext"
import type React from "react"
import { TouchableOpacity, Text, ActivityIndicator, View, type TouchableOpacityProps } from "react-native"

interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  requiresConnection?: boolean
  icon?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = "primary",
  size = "md",
  disabled,
  className,
  requiresConnection = false,
  icon,
  ...props
}) => {
  const { isConnected } = useNetwork()

  const isDisabled = disabled || loading || (requiresConnection && !isConnected)

  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-500"
      case "secondary":
        return "bg-blue-300"
      case "outline":
        return "bg-transparent border border-blue-500"
      default:
        return "bg-blue-500"
    }
  }

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return "py-2 px-3"
      case "md":
        return "py-3 px-4"
      case "lg":
        return "py-4 px-6"
      default:
        return "py-3 px-4"
    }
  }

  const getTextStyle = () => {
    return variant === "outline" ? "text-blue-500" : "text-white"
  }

  return (
    <TouchableOpacity
      className={`
        rounded-lg
        flex items-center justify-center
        ${getVariantStyle()}
        ${getSizeStyle()}
        ${isDisabled ? 'opacity-70' : ''}
        ${className || ''}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#3b82f6" : "white"}
          size="small"
          animating={true}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-medium ${getTextStyle()}`}>
            {requiresConnection && !isConnected ? "Offline" : title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default Button