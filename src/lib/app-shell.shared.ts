import type { ReactNode } from "react";
import type { MainTab } from "./main-tab.shared";
import type { CatalogSearchBarProps } from "../components/catalog-search-bar.shared";

export type HeaderRefreshProps = {
  hasUpdates: boolean;
  pending: boolean;
  onRefresh: () => void;
};

export type AppShellProps = {
  activeTab: MainTab;
  title: string;
  customerName: string;
  cartItemCount: number;
  ordersHasUpdates: boolean;
  accountMenuOpen: boolean;
  catalogSearch?: CatalogSearchBarProps;
  ordersRefresh?: HeaderRefreshProps;
  onTabChange: (tab: MainTab) => void;
  onOpenAccountMenu: () => void;
  onCloseAccountMenu: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  children: ReactNode;
};

export type AppHeaderProps = {
  title?: string;
  searchBar?: CatalogSearchBarProps;
  refresh?: HeaderRefreshProps;
  onOpenMenu?: () => void;
  onBack?: () => void;
};

export type BottomTabBarProps = {
  activeTab: MainTab;
  cartItemCount: number;
  ordersHasUpdates: boolean;
  onTabChange: (tab: MainTab) => void;
};

export type AccountMenuModalProps = {
  visible: boolean;
  customerName: string;
  onClose: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
};
