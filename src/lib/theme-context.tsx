import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LIGHT_THEME,
  themeColorsForMode,
  type AppThemeColors,
  type ThemeMode,
} from "./app-theme.shared";
import { loadThemeMode, saveThemeMode } from "./theme-storage";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: AppThemeColors;
  ready: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  colors: LIGHT_THEME,
  ready: false,
  setMode: () => undefined,
  toggleMode: () => undefined,
});

export function ThemeProvider(props: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadThemeMode()
      .then((saved) => {
        if (!cancelled && saved) {
          setModeState(saved);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void saveThemeMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const next: ThemeMode = current === "light" ? "dark" : "light";
      void saveThemeMode(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: themeColorsForMode(mode),
      ready,
      setMode,
      toggleMode,
    }),
    [mode, ready, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
