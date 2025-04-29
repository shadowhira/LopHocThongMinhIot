import type React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TabContainerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

const TabContainer: React.FC<TabContainerProps> = ({
  activeTab,
  onTabChange,
  tabs,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id ? styles.activeTab : null,
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6', // blue-500
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    color: '#3B82F6', // blue-500
    fontWeight: '500',
  },
  inactiveTabText: {
    color: '#4B5563', // gray-600
  },
});

export default TabContainer;