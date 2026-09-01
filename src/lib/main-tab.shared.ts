export const MAIN_TABS = ["catalog", "cart", "orders"] as const;

export type MainTab = (typeof MAIN_TABS)[number];

export function mainTabLabel(tab: MainTab): string {
  switch (tab) {
    case "catalog":
      return "Каталог";
    case "cart":
      return "Корзина";
    case "orders":
      return "Мои заказы";
  }
}

export function mainTabIcon(tab: MainTab): string {
  switch (tab) {
    case "catalog":
      return "▦";
    case "cart":
      return "◫";
    case "orders":
      return "☰";
  }
}
