import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import { MAIN_TABS, mainTabIcon, mainTabLabel } from "../lib/main-tab.shared";
import type { BottomTabBarProps } from "../lib/app-shell.shared";
import { ProfileIcon } from "./ProfileIcon";

const ACTIVE_CIRCLE = 48;
/** Насколько активный круг выходит вверх из плашки. */
const ACTIVE_LIFT = 14;
const LABEL_LINE = 14;
/** Высота внутренней плашки (без safe-area). */
const SHELL_HEIGHT = 64;
/** Отступ контента, чтобы список не прятался под меню. */
export const BOTTOM_TAB_BAR_CONTENT_INSET =
  ACTIVE_LIFT + SHELL_HEIGHT + 24;

export function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outer,
        {
          paddingBottom: bottomPad,
          paddingTop: ACTIVE_LIFT,
        },
      ]}
    >
      <View style={styles.shellWrap}>
        <View style={styles.shellClip}>
          <BlurView
            intensity={Platform.OS === "ios" ? 55 : 70}
            tint={mode === "dark" ? "dark" : "light"}
            style={styles.shellBlur}
          />
          <View
            style={[
              styles.shellTint,
              mode === "dark" ? styles.shellTintDark : styles.shellTintLight,
            ]}
          />
          <View style={styles.row}>
            {MAIN_TABS.map((tab) => {
              const active = props.activeTab === tab;
              const showCartBadge = tab === "cart" && props.cartItemCount > 0;
              const showOrdersDot =
                tab === "orders" && props.ordersHasUpdates;

              return (
                <Pressable
                  key={tab}
                  onPress={() => props.onTabChange(tab)}
                  style={styles.tab}
                  accessibilityLabel={mainTabLabel(tab)}
                  accessibilityState={{ selected: active }}
                >
                  {active ? (
                    <View style={styles.activeCluster}>
                      <View style={styles.activeBubble}>
                        {tab === "profile" ? (
                          <ProfileIcon color={colors.buttonText} size={22} />
                        ) : (
                          <Text style={styles.iconActive}>
                            {mainTabIcon(tab)}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.labelActive} numberOfLines={1}>
                        {mainTabLabel(tab)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.inactiveIconWrap}>
                      {tab === "profile" ? (
                        <ProfileIcon color={colors.tabInactive} size={20} />
                      ) : (
                        <Text style={styles.iconInactive}>
                          {mainTabIcon(tab)}
                        </Text>
                      )}
                      {showCartBadge ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {props.cartItemCount > 99
                              ? "99+"
                              : props.cartItemCount}
                          </Text>
                        </View>
                      ) : null}
                      {showOrdersDot ? <View style={styles.dot} /> : null}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  const pillRadius = SHELL_HEIGHT / 2;

  return StyleSheet.create({
    outer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 14,
      zIndex: 30,
      elevation: 12,
    },
    shellWrap: {
      height: SHELL_HEIGHT,
    },
    shellClip: {
      flex: 1,
      borderRadius: pillRadius,
      // visible — чтобы активный круг мог выйти вверх; скругление на Blur/tint
      overflow: "visible",
    },
    shellBlur: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: pillRadius,
      overflow: "hidden",
    },
    shellTint: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: pillRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    shellTintLight: {
      backgroundColor: "rgba(255, 255, 255, 0.42)",
    },
    shellTintDark: {
      backgroundColor: "rgba(30, 46, 58, 0.45)",
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    tab: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    inactiveIconWrap: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    activeCluster: {
      alignItems: "center",
      justifyContent: "center",
      // Иконка и подпись едут вместе: центр пары = центр плашки, круг чуть выше.
      transform: [{ translateY: -ACTIVE_LIFT / 2 }],
    },
    activeBubble: {
      width: ACTIVE_CIRCLE,
      height: ACTIVE_CIRCLE,
      borderRadius: ACTIVE_CIRCLE / 2,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.screenBackground,
      marginBottom: 4,
    },
    labelActive: {
      height: LABEL_LINE,
      fontSize: 11,
      lineHeight: LABEL_LINE,
      fontWeight: "700",
      color: colors.tabActive,
      textAlign: "center",
      includeFontPadding: false,
      maxWidth: "100%",
      paddingHorizontal: 2,
    },
    iconActive: {
      color: colors.buttonText,
      fontSize: 22,
      lineHeight: 26,
      textAlign: "center",
      includeFontPadding: false,
    },
    iconInactive: {
      color: colors.tabInactive,
      fontSize: 20,
      lineHeight: 24,
      textAlign: "center",
      includeFontPadding: false,
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderWidth: 1.5,
      borderColor: colors.tabBarBackground,
    },
    badgeText: {
      color: colors.buttonText,
      fontSize: 10,
      fontWeight: "700",
    },
    dot: {
      position: "absolute",
      top: 0,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.updateIndicator,
      borderWidth: 1,
      borderColor: colors.tabBarBackground,
    },
  });
}
