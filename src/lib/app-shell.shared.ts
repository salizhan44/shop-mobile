import type { ReactNode } from "react";
import type { MainTab } from "./main-tab.shared";
import type { CatalogSearchBarProps } from "../components/catalog-search-bar.shared";

export type HeaderRefreshProps = {
  hasUpdates: boolean;
  pending: boolean;
  onRefresh: () => void;
};

export type CatalogChromeProps = {
  searchBar: CatalogSearchBarProps;
  /** По умолчанию true; AppShell выключает вне каталога. */
  showSearch?: boolean;
  favoritesActive: boolean;
  onOpenMenu: () => void;
  onOpenFavorites: () => void;
};

export type AppShellProps = {
  activeTab: MainTab;
  title: string;
  cartItemCount: number;
  ordersHasUpdates: boolean;
  catalogChrome?: CatalogChromeProps;
  accountMenuOpen: boolean;
  onTabChange: (tab: MainTab) => void;
  onCloseAccountMenu: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  children: ReactNode;
};

export type AppHeaderProps = {
  title?: string;
  catalogChrome?: CatalogChromeProps;
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
