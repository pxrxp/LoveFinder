import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "@/services/api";
import { showThemedError } from "@/services/themed-error";
import { useTheme } from "@/contexts/ThemeContext";

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { themeColors } = useTheme();

  const handleSignup = async () => {
    if (!email || !password || !name) return showThemedError("All fields are required", themeColors);
    try {
      await apiFetch('users', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: name }),
      });
      router.replace("/(auth)/login");
    } catch (e: any) {
      showThemedError("Signup failed", themeColors);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark px-8 justify-center">
      <Text className="text-4xl font-extrabold text-textPrimaryLight dark:text-textPrimaryDark mb-2">Create Account</Text>
      <Text className="text-gray-500 font-regular text-lg mb-10">Join LoveFinder today.</Text>

      <View className="gap-5">
        <View>
          <Text className="font-bold uppercase tracking-widest mb-2 ml-1 text-gray-400">Full Name</Text>
          <TextInput placeholder="John Doe" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-textPrimaryLight dark:text-textPrimaryDark font-semibold" />
        </View>
        <View>
          <Text className="font-bold uppercase tracking-widest mb-2 ml-1 text-gray-400">Email Address</Text>
          <TextInput placeholder="example@mail.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-textPrimaryLight dark:text-textPrimaryDark font-semibold" />
        </View>
        <View>
          <Text className="font-bold uppercase tracking-widest mb-2 ml-1 text-gray-400">Password</Text>
          <TextInput placeholder="••••••••" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-textPrimaryLight dark:text-textPrimaryDark font-semibold" />
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handleSignup} className="mt-8">
          <LinearGradient colors={["#FD267D", "#FE6D58"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="py-4 rounded-full items-center shadow-lg">
            <Text className="text-white font-bold text-lg">Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
