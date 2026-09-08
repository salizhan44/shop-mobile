const fs = require("fs");
const path = require("path");

const googleServicesPath = path.join(__dirname, "google-services.json");
const hasGoogleServices = fs.existsSync(googleServicesPath);

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Магазин",
  slug: "shop-mobile",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "shop",
  backgroundColor: "#ecf7fd",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.rola.shop",
  },
  android: {
    package: "com.rola.shop",
    predictiveBackGestureEnabled: false,
    usesCleartextTraffic: true,
    softwareKeyboardLayoutMode: "resize",
    ...(hasGoogleServices
      ? { googleServicesFile: "./google-services.json" }
      : {}),
  },
  plugins: [
    "expo-secure-store",
    "expo-web-browser",
    "expo-dev-client",
    [
      "expo-notifications",
      {
        color: "#008ef1",
        defaultChannel: "orders",
      },
    ],
  ],
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? "",
    },
  },
};

module.exports = { expo: config };
