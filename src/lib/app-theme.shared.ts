export type ThemeMode = "light" | "dark";

export type AppThemeColors = {
  screenBackground: string;
  textPrimary: string;
  textMuted: string;
  cardBackground: string;
  buttonBackground: string;
  buttonText: string;
  link: string;
  error: string;
  border: string;
  cardBorder: string;
  updateIndicator: string;
  accent: string;
  headerBackground: string;
  tabBarBackground: string;
  tabInactive: string;
  tabActive: string;
  overlay: string;
  searchBackground: string;
  iconSoft: string;
  logoMark: string;
  logoMarkBg: string;
  inputBackground: string;
};

/** Бело-голубая светлая гамма + сине-голубой акцент. */
export const LIGHT_THEME: AppThemeColors = {
  screenBackground: "#EAF3F9",
  textPrimary: "#1B3A4B",
  textMuted: "#6B8A9A",
  cardBackground: "#FFFFFF",
  buttonBackground: "#4A9BC7",
  buttonText: "#FFFFFF",
  link: "#3A87B0",
  error: "#C45C5C",
  border: "#D5E4EE",
  cardBorder: "#FFFFFF",
  updateIndicator: "#4A9BC7",
  accent: "#4A9BC7",
  headerBackground: "#EAF3F9",
  tabBarBackground: "#FFFFFF",
  tabInactive: "#8AA3B3",
  tabActive: "#4A9BC7",
  overlay: "rgba(27, 58, 75, 0.4)",
  searchBackground: "#FFFFFF",
  iconSoft: "#7FA0B2",
  logoMark: "#1B3A4B",
  logoMarkBg: "#FFFFFF",
  inputBackground: "#FFFFFF",
};

/** Тёмная пара к бело-голубой гамме. */
export const DARK_THEME: AppThemeColors = {
  screenBackground: "#15222B",
  textPrimary: "#E8F2F8",
  textMuted: "#9BB4C2",
  cardBackground: "#1E2E3A",
  buttonBackground: "#5AABD4",
  buttonText: "#0F1A22",
  link: "#7EC0E0",
  error: "#D48484",
  border: "#2E4352",
  cardBorder: "#2E4352",
  updateIndicator: "#5AABD4",
  accent: "#5AABD4",
  headerBackground: "#15222B",
  tabBarBackground: "#1A2832",
  tabInactive: "#7A93A3",
  tabActive: "#5AABD4",
  overlay: "rgba(0, 0, 0, 0.55)",
  searchBackground: "#243642",
  iconSoft: "#8AA3B3",
  logoMark: "#E8F2F8",
  logoMarkBg: "#243642",
  inputBackground: "#243642",
};

/** @deprecated Используйте useAppTheme().colors */
export const APP_THEME = LIGHT_THEME;

export function themeColorsForMode(mode: ThemeMode): AppThemeColors {
  return mode === "dark" ? DARK_THEME : LIGHT_THEME;
}

export function isThemeMode(value: string): value is ThemeMode {
  return value === "light" || value === "dark";
}
