import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const FAVORITES_KEY = "favoriteProductIds";
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

export async function loadFavoriteIds(): Promise<string[]> {
  const raw = await readValue(FAVORITES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export async function saveFavoriteIds(ids: string[]): Promise<void> {
  await writeValue(FAVORITES_KEY, JSON.stringify(ids));
}

export function toggleFavoriteId(
  ids: readonly string[],
  productId: string,
): string[] {
  if (ids.includes(productId)) {
    return ids.filter((id) => id !== productId);
  }
  return [...ids, productId];
}
