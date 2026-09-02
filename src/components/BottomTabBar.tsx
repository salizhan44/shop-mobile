import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_THEME } from "../lib/app-theme.shared";
import { MAIN_TABS, mainTabIcon, mainTabLabel } from "../lib/main-tab.shared";
import type { BottomTabBarProps } from "../lib/app-shell.shared";

export function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: 10 + insets.bottom }]}>
      {MAIN_TABS.map((tab) => {
        const active = props.activeTab === tab;
        const showCartBadge = tab === "cart" && props.cartItemCount > 0;
        const showOrdersDot = tab === "orders" && props.ordersHasUpdates;

        return (
          <Pressable
            key={tab}
            onPress={() => props.onTabChange(tab)}
            style={styles.tab}
          >
            <View style={styles.iconWrap}>
              <Text
                style={[
                  styles.icon,
                  active ? styles.iconActive : styles.iconInactive,
                ]}
              >
                {mainTabIcon(tab)}
              </Text>
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

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: APP_THEME.tabBarBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: APP_THEME.border,
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
    color: APP_THEME.tabActive,
  },
  iconInactive: {
    color: APP_THEME.tabInactive,
  },
  label: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "500",
  },
  labelActive: {
    color: APP_THEME.tabActive,
    fontWeight: "700",
  },
  labelInactive: {
    color: APP_THEME.tabInactive,
  },
  activeLine: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: APP_THEME.tabActive,
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
    backgroundColor: APP_THEME.accent,
    borderWidth: 1.5,
    borderColor: APP_THEME.tabBarBackground,
  },
  badgeText: {
    color: "#ffffff",
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
    backgroundColor: APP_THEME.updateIndicator,
    borderWidth: 1,
    borderColor: APP_THEME.tabBarBackground,
  },
});
