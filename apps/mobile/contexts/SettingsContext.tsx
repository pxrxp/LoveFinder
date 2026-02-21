import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Settings {
  sendReceipts: boolean;
  getNotifications: boolean;
  [key: string]: any;
}

interface SettingsContextValue {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const defaultSettings: Settings = {
  sendReceipts: true,
  getNotifications: true,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

  useEffect(() => {
    (async () => {
      const loaded: Partial<Settings> = {};
      for (const key of Object.keys(defaultSettings)) {
        const val = await AsyncStorage.getItem(key);
        if (val !== null) {
          try {
            loaded[key] = JSON.parse(val);
          } catch {}
        }
      }
      setSettingsState((prev) => ({ ...prev, ...loaded }));
    })();
  }, []);

  const setSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    setSettingsState((prev) => ({ ...prev, [key]: value }));
    try {
      await AsyncStorage.setItem(key as string, JSON.stringify(value));
    } catch {}
  };

  return (
    <SettingsContext.Provider value={{ settings, setSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
};
