import { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { showThemedError } from "@/services/themed-error";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useContext(AuthContext)!;
  const { themeColors } = useTheme();

  const handleSubmit = async () => {
    if (!email || !password) {
      return showThemedError("Please fill in all fields", themeColors);
    }
    try {
      login(email, password);
    } catch (e: any) {
      showThemedError("Invalid email or password", themeColors);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior="padding"
      className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark px-8 justify-center"
    >
      <View className="items-center mb-12">
        <MaskedView
          style={{marginBottom: 12}}
          maskElement={<MaterialCommunityIcons name="heart-multiple" size={80} />}
        >
          <LinearGradient
            colors={["#FD267D", "#FE6D58"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 80, height: 80 }}
          />
        </MaskedView>
        <Text className="text-4xl font-extrabold mt-4 text-textPrimaryLight dark:text-textPrimaryDark">
          LoveFinder
        </Text>
        <Text className="text-gray-500 font-regular text-lg my-5">Sign in to continue</Text>
      </View>

      <View className="mt-5">
        <View>
          <Text className="font-bold uppercase tracking-widest mb-2 ml-1 text-gray-400">Email Address</Text>
          <TextInput
            placeholder="example@mail.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-textPrimaryLight dark:text-textPrimaryDark font-semibold border border-transparent focus:border-[#FD267D]"
          />
        </View>

        <View className="mt-4">
          <Text className="font-bold uppercase tracking-widest mt-5 mb-2 ml-1 text-gray-400">Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-textPrimaryLight dark:text-textPrimaryDark font-semibold border border-transparent focus:border-[#FD267D]"
          />
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading}
          style={{marginTop: 45}}
        >
          <LinearGradient
            colors={["#FD267D", "#FE6D58"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-full items-center shadow-lg overflow-hidden"
          >
            {loading ? (
              <LoadingScreen/>
            ) : (
              <Text className="text-white font-bold text-lg">Login</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity className="mt-6 items-center">
          <Text className="text-gray-500 font-semibold">
            Don't have an account? <Text className="text-[#FD267D]">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
