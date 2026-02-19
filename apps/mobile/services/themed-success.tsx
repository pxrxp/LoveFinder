import { showMessage } from "react-native-flash-message";
import { colors } from "@/constants/colors";

export function showThemedSuccess(message: string, themeColors: typeof colors.light) {
  showMessage({
    message: "Success",
    description: message,
    type: "success",
    backgroundColor: themeColors.bgPrimary,
    color: themeColors.textPrimary,
    icon: "success",
    floating: true,
    duration: 3000,
    style: { 
      borderLeftWidth: 4, 
      borderLeftColor: "#2EB62C", // Success Green
      marginTop: 40 
    },
  });
}
