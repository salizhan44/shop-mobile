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
const SEARCH_FIELD_HEIGHT = 42;
/** Сдвиг лого вверх ≈ 20% его высоты. */
const LOGO_SHIFT_UP = Math.round(HEADER_LOGO_HEIGHT * 0.2);
const CATALOG_TOP_ROW_HEIGHT = Math.round(HEADER_LOGO_HEIGHT + 8);
const SEARCH_GAP_AFTER_LOGO_NUDGE = 3.4 * 0.6 - SEARCH_FIELD_HEIGHT * 0.3;
/** От визуального низа лого (бокс + сдвиг) до поля поиска. */
const GAP_LOGO_TO_SEARCH =
  CATALOG_TOP_ROW_HEIGHT / 2 +
  LOGO_SHIFT_UP -
  HEADER_LOGO_HEIGHT / 2 +
  SEARCH_GAP_AFTER_LOGO_NUDGE;

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
    const topPad = insets.top + 6.4 * 0.6;
    const bottomPad = chrome.showSearch ? 9.6 * 0.6 * 1.5 : 4 * 0.6;
    return (
      <View
        style={[
          styles.catalogHeader,
          { paddingTop: topPad, paddingBottom: bottomPad },
        ]}
      >
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
          <View style={styles.searchRow}>
            <View style={styles.searchBarGrow}>
              <CatalogSearchBar {...chrome.searchBar} />
            </View>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                chrome.onOpenFilter?.();
              }}
              style={[
                styles.filterButton,
                chrome.filterActive ? styles.filterButtonActive : null,
              ]}
              accessibilityLabel="Фильтр"
            >
              <Text
                style={[
                  styles.filterButtonText,
                  chrome.filterActive ? styles.filterButtonTextActive : null,
                ]}
              >
                Фильтр
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 6.4 * 0.6 }]}>
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
      backgroundColor: colors.headerBackground,
    },
    catalogTopRow: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: CATALOG_TOP_ROW_HEIGHT,
      marginBottom:
        SEARCH_GAP_AFTER_LOGO_NUDGE - GAP_LOGO_TO_SEARCH * (0.5 + 0.5 * 0.2),
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    searchBarGrow: {
      flex: 1,
      minWidth: 0,
    },
    filterButton: {
      borderRadius: 999,
      paddingHorizontal: 14,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.searchBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.buttonBackground,
      borderColor: colors.buttonBackground,
    },
    filterButtonText: {
      fontSize: 15,
      fontWeight: "400",
      color: colors.textMuted,
    },
    filterButtonTextActive: {
      color: colors.buttonText,
      fontSize: 15,
      fontWeight: "400",
    },
    logoCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 0,
      transform: [{ translateY: -LOGO_SHIFT_UP }],
    },
    topSide: {
      zIndex: 1,
      minHeight: 44,
      justifyContent: "center",
      transform: [{ translateY: -LOGO_SHIFT_UP }],
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
