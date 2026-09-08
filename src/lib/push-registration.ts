import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { registerPushToken } from "./api";
import type { PushPlatform } from "./push.shared";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function resolveProjectId(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() ||
    Constants.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId
  );
}

function platformForPush(): PushPlatform {
  if (Platform.OS === "ios") {
    return "ios";
  }
  if (Platform.OS === "android") {
    return "android";
  }
  if (Platform.OS === "web") {
    return "web";
  }
  return "unknown";
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync("orders", {
    name: "Заказы",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#008ef1",
  });
}

/**
 * Запрашивает разрешение и регистрирует push-токен на сервере.
 * Нужен development build + google-services.json (Android).
 * В Expo Go на новых SDK пуши ограничены.
 */
export async function registerForOrderPushNotifications(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") {
    return;
  }

  let token: string | null = null;
  const projectId = resolveProjectId();
  try {
    if (projectId) {
      const expo = await Notifications.getExpoPushTokenAsync({ projectId });
      token = expo.data;
    }
  } catch (error) {
    console.warn("[push] Expo token failed", error);
  }

  if (!token) {
    try {
      const device = await Notifications.getDevicePushTokenAsync();
      token = typeof device.data === "string" ? device.data : null;
    } catch (error) {
      console.warn("[push] Device token failed", error);
    }
  }

  if (!token) {
    return;
  }

  await registerPushToken(token, platformForPush());
}
