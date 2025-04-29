"use client";

import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type LocationAccessModalProps = {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
};

const LocationAccessModal: React.FC<LocationAccessModalProps> = ({
  visible,
  onAllow,
  onSkip,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Location access</Text>
          <Text style={styles.description}>
            Allow access to your location for personalized recommendation.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.allowButton}
              onPress={onAllow}
            >
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  allowButton: {
    flex: 1,
    backgroundColor: '#3B82F6', // blue-500
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#E5E7EB', // gray-200
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  allowButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  skipButtonText: {
    color: '#4B5563', // gray-600
    fontWeight: '500',
  },
});

export default LocationAccessModal;