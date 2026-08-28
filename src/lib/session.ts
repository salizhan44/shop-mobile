import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { CustomerAuthSuccess, CustomerPublic } from "./api";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const CUSTOMER_KEY = "customer";
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

async function deleteValue(key: string): Promise<void> {
  if (Platform.OS === "web") {
    webStore.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken(): Promise<string | null> {
  return readValue(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return readValue(REFRESH_KEY);
}

export async function saveSession(auth: CustomerAuthSuccess): Promise<void> {
  await writeValue(ACCESS_KEY, auth.accessToken);
  await writeValue(REFRESH_KEY, auth.refreshToken);
  await writeValue(CUSTOMER_KEY, JSON.stringify(auth.customer));
}

export async function loadCustomer(): Promise<CustomerPublic | null> {
  const raw = await readValue(CUSTOMER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as CustomerPublic;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await deleteValue(ACCESS_KEY);
  await deleteValue(REFRESH_KEY);
  await deleteValue(CUSTOMER_KEY);
}
