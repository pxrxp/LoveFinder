import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function OnboardingStep({ title, description, children, onNext, loading, disabled }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark px-8 py-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-8 w-10">
        <Ionicons name="chevron-back" size={32} color="#FD267D" />
      </TouchableOpacity>
      
      <Text className="text-3xl font-extrabold text-textPrimaryLight dark:text-textPrimaryDark">{title}</Text>
      {description && <Text className="text-gray-500 font-semibold text-base mt-2">{description}</Text>}
      
      <View className="flex-1 mt-10">{children}</View>
      
      <TouchableOpacity 
        disabled={disabled || loading}
        onPress={onNext}
        className={`py-4 rounded-full items-center ${disabled ? 'bg-gray-200 dark:bg-white/10' : 'bg-[#FD267D]'}`}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Continue</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
