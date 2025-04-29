import type React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface FilterContainerProps {
  onSortPress?: () => void;
  onFilterPress?: () => void;
}

const FilterContainer: React.FC<FilterContainerProps> = ({
  onSortPress,
  onFilterPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onSortPress}>
        <Feather name="arrow-down" size={16} color="#333" />
        <Text style={styles.buttonText}>SORT BY</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onFilterPress}>
        <Feather name="sliders" size={16} color="#333" />
        <Text style={styles.buttonText}>FILTER</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "10%",
    paddingTop: 8,
    paddingRight: 20,
    paddingBottom: 8,
    paddingLeft: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: "65%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9999,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
});

export default FilterContainer;
