"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signup, loading, error, clearError, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    return () => clearError();
  }, []);

  // Uncomment if you want to auto-navigate after signup
  // useEffect(() => {
  //   if (user) {
  //     navigation.replace("InterestSelection");
  //   }
  // }, [user, navigation]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      setValidationError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setValidationError("Please enter your email");
      return;
    }
    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      setValidationError("Please enter a password");
      return;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    setValidationError("");
    signup({
      email,
      password,
      displayName: name,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.headerText}>Hãy bắt đầu từ đây!</Text>

          <Input
            label="Name"
            placeholder="Enter Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setValidationError("");
            }}
            icon="user"
          />

          <Input
            label="Email"
            placeholder="Enter Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setValidationError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail"
          />

          <Input
            label="Password"
            placeholder="Type in your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setValidationError("");
            }}
            isPassword
            icon="lock"
          />

          <Input
            label="Re-enter Password"
            placeholder="Re-type your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setValidationError("");
            }}
            isPassword
            icon="lock"
          />

          {(validationError || error) && (
            <Text style={styles.errorText}>
              {validationError || error?.message || "Registration failed. Please try again."}
            </Text>
          )}

          <View style={styles.checkboxContainer}>
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onToggle={() => setRememberMe(!rememberMe)}
            />
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.signupButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24, // p-6
  },
  content: {
    marginTop: 128, // mt-32
  },
  headerText: {
    fontSize: 24, // text-2xl
    color: '#1F2937', // gray-800
    fontWeight: '400', // font-normal
    marginBottom: 24, // mb-6
  },
  errorText: {
    color: '#EF4444', // red-500
    marginBottom: 8, // mb-2
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // mb-6
  },
  forgotPasswordText: {
    color: '#3B82F6', // blue-500
  },
  signupButton: {
    marginBottom: 32, // mb-8
    borderRadius: 12, // rounded-xl
    width: '60%', // w-3/5
    alignSelf: 'center',
  },
});

export default SignupScreen;