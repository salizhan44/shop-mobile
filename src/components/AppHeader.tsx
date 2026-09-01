import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CatalogSearchBar } from "./CatalogSearchBar";
import { APP_THEME } from "../lib/app-theme.shared";
import type { AppHeaderProps } from "../lib/app-shell.shared";

export function AppHeader(props: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  function openMenu() {
    Keyboard.dismiss();
    props.onOpenMenu?.();
  }

  function goBack() {
    Keyboard.dismiss();
    props.onBack?.();
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {props.onBack ? (
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
        ) : null}
        {props.searchBar ? (
          <CatalogSearchBar {...props.searchBar} />
        ) : (
          <View style={styles.titles}>
            <Text style={styles.title} numberOfLines={1}>
              {props.title}
            </Text>
          </View>
        )}
      </View>
      {props.onOpenMenu ? (
        <Pressable onPress={openMenu} style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </Pressable>
      ) : (
        <View style={styles.menuPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: APP_THEME.headerBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: APP_THEME.border,
    gap: 10,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APP_THEME.screenBackground,
  },
  backText: {
    fontSize: 20,
    color: APP_THEME.textPrimary,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: APP_THEME.textPrimary,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APP_THEME.screenBackground,
    borderWidth: 1,
    borderColor: APP_THEME.border,
  },
  menuIcon: {
    fontSize: 22,
    lineHeight: 24,
    color: APP_THEME.textPrimary,
    fontWeight: "700",
  },
  menuPlaceholder: {
    width: 40,
    height: 40,
  },
});
