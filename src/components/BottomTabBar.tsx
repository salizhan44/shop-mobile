import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import { MAIN_TABS, mainTabIcon, mainTabLabel } from "../lib/main-tab.shared";
import type { BottomTabBarProps } from "../lib/app-shell.shared";
import { ProfileIcon } from "./ProfileIcon";

export function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.bar, { paddingBottom: 10 + insets.bottom }]}>
      {MAIN_TABS.map((tab) => {
        const active = props.activeTab === tab;
        const showCartBadge = tab === "cart" && props.cartItemCount > 0;
        const showOrdersDot = tab === "orders" && props.ordersHasUpdates;
        const iconColor = active ? colors.tabActive : colors.tabInactive;

        return (
          <Pressable
            key={tab}
            onPress={() => props.onTabChange(tab)}
            style={styles.tab}
          >
            <View style={styles.iconWrap}>
              {tab === "profile" ? (
                <ProfileIcon color={iconColor} size={22} />
              ) : (
                <Text
                  style={[
                    styles.icon,
                    active ? styles.iconActive : styles.iconInactive,
                  ]}
                >
                  {mainTabIcon(tab)}
                </Text>
              )}
              {showCartBadge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {props.cartItemCount > 99 ? "99+" : props.cartItemCount}
                  </Text>
                </View>
              ) : null}
              {showOrdersDot ? <View style={styles.dot} /> : null}
            </View>
            <Text
              style={[
                styles.label,
                active ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {mainTabLabel(tab)}
            </Text>
            {active ? <View style={styles.activeLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      backgroundColor: colors.tabBarBackground,
      paddingTop: 10,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 8,
      paddingBottom: 4,
      position: "relative",
    },
    iconWrap: {
      position: "relative",
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    icon: {
      fontSize: 20,
      lineHeight: 24,
    },
    iconActive: {
      color: colors.tabActive,
    },
    iconInactive: {
      color: colors.tabInactive,
    },
    label: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: "500",
    },
    labelActive: {
      color: colors.tabActive,
      fontWeight: "700",
    },
    labelInactive: {
      color: colors.tabInactive,
    },
    activeLine: {
      position: "absolute",
      top: 0,
      width: 28,
      height: 2,
      borderRadius: 1,
      backgroundColor: colors.tabActive,
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -12,
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
      top: -2,
      right: -6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.updateIndicator,
      borderWidth: 1,
      borderColor: colors.tabBarBackground,
    },
  });
}
