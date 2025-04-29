import React from "react";
import { ImageSourcePropType, View } from "react-native";

type AvatarProps = {
  source?: ImageSourcePropType;
  name: string;
  size?: number;
  isOnline?: boolean;
};

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 40,
  isOnline = false,
}) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

    return (
        <View></View>
    )
};