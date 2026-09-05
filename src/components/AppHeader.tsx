import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CatalogSearchBar } from "./CatalogSearchBar";
import { BrandLogo } from "./BrandLogo";
import { HeartIcon } from "./HeartIcon";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import type { AppHeaderProps } from "../lib/app-shell.shared";

/** Высота лого в шапке (+90% от исходных 34, затем ещё +60%). */
const HEADER_LOGO_HEIGHT = Math.round(34 * 1.9 * 1.6);

export function AppHeader(props: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const chrome = props.catalogChrome;

  function openMenu() {
    Keyboard.dismiss();
    props.onOpenMenu?.();
    chrome?.onOpenMenu();
  }

  function goBack() {
    Keyboard.dismiss();
    props.onBack?.();
  }

  function onRefresh() {
    Keyboard.dismiss();
    props.refresh?.onRefresh();
  }

  if (chrome) {
    return (
      <View style={[styles.catalogHeader, { paddingTop: insets.top + 8 }]}>
        <View style={styles.catalogTopRow}>
          <View style={styles.topSide}>
            <Pressable
              onPress={openMenu}
              style={styles.plainIconHit}
              accessibilityLabel="Меню"
            >
              <View style={styles.menuLines}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </Pressable>
          </View>
          <View style={styles.logoCenter} pointerEvents="none">
            <BrandLogo height={HEADER_LOGO_HEIGHT} />
          </View>
          <View style={[styles.topSide, styles.topRight]}>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                chrome.onOpenFavorites();
              }}
              style={styles.plainIconHit}
              accessibilityLabel="Избранное"
            >
              <HeartIcon
                filled={chrome.favoritesActive}
                color={
                  chrome.favoritesActive ? colors.accent : colors.iconSoft
                }
                size={26}
              />
            </Pressable>
          </View>
        </View>
        {chrome.showSearch ? (
          <CatalogSearchBar {...chrome.searchBar} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {props.onBack ? (
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            {props.title}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        {props.refresh ? (
          <Pressable
            onPress={onRefresh}
            disabled={props.refresh.pending}
            style={[
              styles.refreshBare,
              props.refresh.pending ? styles.iconButtonDisabled : null,
            ]}
            accessibilityLabel="Обновить"
          >
            <Text style={styles.refreshBareSymbol}>↻</Text>
            {props.refresh.hasUpdates ? <View style={styles.dot} /> : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    catalogHeader: {
      flexShrink: 0,
      zIndex: 20,
      elevation: 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.headerBackground,
    },
    catalogTopRow: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: Math.round(HEADER_LOGO_HEIGHT + 12),
      marginBottom: 3.4,
    },
    logoCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 0,
    },
    topSide: {
      zIndex: 1,
      minHeight: 44,
      justifyContent: "center",
    },
    topRight: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    plainIconHit: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    header: {
      flexShrink: 0,
      zIndex: 20,
      elevation: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.headerBackground,
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
      justifyContent: "flex-end",
      gap: 8,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
    },
    backText: {
      fontSize: 20,
      color: colors.textPrimary,
      fontWeight: "400",
    },
    titles: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    refreshBare: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    refreshBareSymbol: {
      fontSize: 24,
      lineHeight: 26,
      marginTop: -4,
      color: colors.iconSoft,
      fontWeight: "400",
      includeFontPadding: false,
      textAlign: "center",
    },
    iconButtonDisabled: {
      opacity: 0.6,
    },
    menuLines: {
      width: 22,
      gap: 5,
    },
    menuLine: {
      height: 2.5,
      borderRadius: 1,
      backgroundColor: colors.iconSoft,
    },
    dot: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.updateIndicator,
    },
  });
}
