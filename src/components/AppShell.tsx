import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { APP_THEME } from "../lib/app-theme.shared";
import { mainTabLabel } from "../lib/main-tab.shared";
import type { AppShellProps } from "../lib/app-shell.shared";
import { AccountMenuModal } from "./AccountMenuModal";
import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";

export function AppShell(props: AppShellProps) {
  const showSearch = props.activeTab === "catalog" && props.catalogSearch;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AppHeader
        title={showSearch ? undefined : props.title}
        searchBar={showSearch ? props.catalogSearch : undefined}
        refresh={
          props.activeTab === "orders" ? props.ordersRefresh : undefined
        }
        onOpenMenu={props.onOpenAccountMenu}
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
        customerName={props.customerName}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: APP_THEME.screenBackground,
  },
  content: {
    flex: 1,
  },
});
