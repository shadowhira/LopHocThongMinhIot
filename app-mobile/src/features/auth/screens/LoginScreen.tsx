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
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, loading, error, clearError } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    return () => clearError();
  }, []);

  const handleLogin = async () => {
    if (!emailOrUsername.trim()) {
      setValidationError("Please enter your email or username");
      return;
    }
    if (!password.trim()) {
      setValidationError("Please enter your password");
      return;
    }
    setValidationError("");
    login({ email: emailOrUsername, password });
  };

  const navigateToSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.headerText}>
            Khám phá không gian yêu thích của bạn với chúng tôi!
          </Text>

          <Input
            label="Username"
            placeholder="Type your username/email"
            value={emailOrUsername}
            onChangeText={(text) => {
              setEmailOrUsername(text);
              setValidationError("");
            }}
            autoCapitalize="none"
            icon="user"
          />

          <Input
            label="Password"
            placeholder="Type your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setValidationError("");
            }}
            isPassword
            icon="lock"
          />

          {(validationError || error) && (
            <Text style={styles.errorText}>
              {validationError || error?.message || "Login failed. Please try again."}
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
            title="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text style={styles.signupText}>Create account</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>or</Text>
            <Text style={styles.signupMethodText}>Signup using</Text>
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="apple" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={24} color="#4285F4" />
            </TouchableOpacity>
          </View>
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
    padding: 24,
  },
  content: {
    marginTop: 128,
  },
  headerText: {
    fontSize: 24,
    color: '#1F2937', // gray-800
    fontWeight: '400',
    marginBottom: 24,
  },
  errorText: {
    color: '#EF4444', // red-500
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3B82F6', // blue-500
  },
  loginButton: {
    marginBottom: 32,
    borderRadius: 12,
    width: '60%', // w-3/5
    alignSelf: 'center',
  },
  signupContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    color: '#1D4ED8', // blue-700
    fontSize: 14,
  },
  orText: {
    color: 'black',
    fontSize: 14,
    marginVertical: 4,
  },
  signupMethodText: {
    color: 'black',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16, // gap-4
  },
  socialButton: {
    padding: 8,
  },
});

export default LoginScreen;