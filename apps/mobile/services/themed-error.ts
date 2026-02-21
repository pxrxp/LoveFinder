import { showMessage } from "react-native-flash-message";
import { colors } from "@/constants/colors";

export function showThemedError(
  message: string,
  themeColors: typeof colors.light,
) {
  showMessage({
    message: "Error",
    description: message,
    type: "default",
    backgroundColor: themeColors.bgPrimary,
    color: themeColors.textPrimary,
    icon: "warning",
    duration: 4000,
  });
}
