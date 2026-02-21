import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "@/services/api";
import { showThemedError } from "@/services/themed-error";
import { useTheme } from "@/contexts/ThemeContext";
import { createUser } from "@/services/users";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { themeColors } = useTheme();

  const handleSignup = async () => {
    if (!email || !password)
      return showThemedError("All fields are required", themeColors);
    try {
      await createUser(email, password);
      router.replace("/(root)/(auth)/login");
    } catch (e: any) {
      showThemedError(`Signup failed: ${e.message}`, themeColors);
    }
  };

  const RuleText = ({ text }: { text: string }) => (
    <View className="flex-row items-center gap-2 mb-1">
      <View className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
      <Text className="text-xs text-gray-500 font-medium">{text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark px-8 justify-center"
    >
      <Text className="text-4xl font-extrabold text-textPrimaryLight dark:text-textPrimaryDark mb-2">
        Create Account
      </Text>
      <Text className="text-gray-500 font-regular text-lg mb-10">
        Join LoveFinder today.
      </Text>

      <View className="gap-5">
        <View>
          <Text className="font-bold uppercase tracking-widest my-3 ml-1 text-gray-400">
            Email Address
          </Text>
          <TextInput
            placeholder="example@mail.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-textPrimaryLight dark:text-textPrimaryDark font-semibold"
          />
        </View>
        <View>
          <Text className="font-bold uppercase tracking-widest my-3 ml-1 text-gray-400">
            Password
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-textPrimaryLight dark:text-textPrimaryDark font-semibold"
          />
        </View>

        <View className="mt-4 ml-2">
          <Text className="text-gray-400 font-bold text-xs mb-2 uppercase tracking-wide">
            Requirements:
          </Text>
          <RuleText text="At least 8 characters long" />
          <RuleText text="One uppercase & lowercase letter" />
          <RuleText text="One number & special character" />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSignup}
        className="mt-8"
      >
        <LinearGradient
          colors={["#FD267D", "#FE6D58"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="py-4 rounded-full items-center shadow-lg"
        >
          <Text className="text-white font-bold text-lg">Sign Up</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
