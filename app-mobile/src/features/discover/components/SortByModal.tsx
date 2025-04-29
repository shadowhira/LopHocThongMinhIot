"use client";

import { Feather } from "@expo/vector-icons";
import type React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";

interface SortByModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
  selectedOption: string;
}

const sortOptions = [
  { id: "relevance", label: "Relevance", icon: "trending-up" },
  { id: "newest", label: "Newest", icon: "clock" },
  { id: "oldest", label: "Oldest", icon: "clock" },
  { id: "mostPopular", label: "Most Popular", icon: "star" },
  { id: "mostReviewed", label: "Most Reviewed", icon: "message-square" },
];

const SortByModal: React.FC<SortByModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedOption,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort By</Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionItem}
                    onPress={() => {
                      onSelect(option.id);
                      onClose();
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Feather
                        className={option.icon}
                        size={20}
                        color="#4B5563"
                      />
                      <Text style={styles.optionText}>{option.label}</Text>
                    </View>
                    {selectedOption === option.id && (
                      <Feather name="check" size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#1F2937",
  },
});

export default SortByModal;
