import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import { mainTabLabel } from "../lib/main-tab.shared";
import type { AppShellProps } from "../lib/app-shell.shared";
import { AccountMenuModal } from "./AccountMenuModal";
import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";

export function AppShell(props: AppShellProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <AppHeader
        catalogChrome={
          props.catalogChrome
            ? {
                ...props.catalogChrome,
                showSearch: props.activeTab === "catalog",
              }
            : undefined
        }
      />
      <View style={styles.content}>{props.children}</View>
      <BottomTabBar
        activeTab={props.activeTab}
        cartItemCount={props.cartItemCount}
        ordersHasUpdates={props.ordersHasUpdates}
        onTabChange={props.onTabChange}
      />
      <AccountMenuModal
        visible={props.accountMenuOpen}
        onClose={props.onCloseAccountMenu}
        onOpenSupport={props.onOpenSupport}
        onLogout={props.onLogout}
      />
    </View>
  );
}

export function getMainTabTitle(tab: AppShellProps["activeTab"]): string {
  return mainTabLabel(tab);
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    content: {
      flex: 1,
      minHeight: 0,
      zIndex: 0,
    },
  });
}
