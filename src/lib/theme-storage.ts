import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { isThemeMode, type ThemeMode } from "./app-theme.shared";

const THEME_KEY = "themeMode";
const webStore = new Map<string, string>();

async function writeValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    webStore.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function readValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return webStore.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

export async function loadThemeMode(): Promise<ThemeMode | null> {
  const raw = await readValue(THEME_KEY);
  if (!raw || !isThemeMode(raw)) {
    return null;
  }
  return raw;
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await writeValue(THEME_KEY, mode);
}
