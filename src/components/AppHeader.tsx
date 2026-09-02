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

  function onRefresh() {
    Keyboard.dismiss();
    props.refresh?.onRefresh();
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
      <View style={styles.right}>
        {props.refresh ? (
          <Pressable
            onPress={onRefresh}
            disabled={props.refresh.pending}
            style={[
              styles.iconButton,
              props.refresh.pending ? styles.iconButtonDisabled : null,
            ]}
          >
            <Text style={styles.refreshSymbol}>↻</Text>
            {props.refresh.hasUpdates ? <View style={styles.dot} /> : null}
          </Pressable>
        ) : null}
        {props.onOpenMenu ? (
          <Pressable onPress={openMenu} style={styles.iconButton}>
            <View style={styles.menuLines}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </Pressable>
        ) : (
          <View style={styles.menuPlaceholder} />
        )}
      </View>
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
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontWeight: "400",
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APP_THEME.screenBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_THEME.border,
    position: "relative",
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  refreshSymbol: {
    fontSize: 22,
    lineHeight: 24,
    color: APP_THEME.iconSoft,
    fontWeight: "400",
    includeFontPadding: false,
    textAlign: "center",
  },
  menuLines: {
    width: 16,
    gap: 4,
  },
  menuLine: {
    height: StyleSheet.hairlineWidth * 2,
    borderRadius: 1,
    backgroundColor: APP_THEME.iconSoft,
  },
  menuPlaceholder: {
    width: 40,
    height: 40,
  },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_THEME.updateIndicator,
    borderWidth: 1,
    borderColor: APP_THEME.headerBackground,
  },
});
