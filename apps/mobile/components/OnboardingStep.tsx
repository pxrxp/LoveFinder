import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OnboardingStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function OnboardingStep({
  title,
  description,
  children,
  onNext,
  loading,
  disabled,
}: OnboardingStepProps) {
  const buttonEnabled = !disabled && !loading;

  return (
    <SafeAreaView
      className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{flex:1, paddingHorizontal: 32 }}
        keyboardVerticalOffset={100}
      >
        <View className="flex-1 items-center w-full">
          <View className="items-center mb-8">
            <Text className="text-3xl font-extrabold text-textPrimaryLight dark:text-textPrimaryDark text-center">
              {title}
            </Text>
            {description && (
              <Text className="text-gray-500 font-regular text-base mt-2 text-center">
                {description}
              </Text>
            )}
          </View>

          <View className="w-full flex-1">{children}</View>

          <View className="w-full pb-8">
            <TouchableOpacity
              disabled={!buttonEnabled}
              onPress={onNext}
              className={`py-4 rounded-full items-center w-full ${
                buttonEnabled ? "bg-accent" : "bg-gray-200 dark:bg-white/10"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-regular text-lg">Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
