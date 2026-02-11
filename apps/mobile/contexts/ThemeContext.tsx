import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
type Theme = "light" | "dark";

function isTheme(t: any): t is Theme {
  return t === "light" || t === "dark";
}

export function ThemeProvider({ children }: {children : ReactNode}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((t) => {
      if (t && isTheme(t)) {
        setTheme(t);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{theme, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
