export const MAIN_TABS = ["catalog", "cart", "orders", "profile"] as const;

export type MainTab = (typeof MAIN_TABS)[number];

export function mainTabLabel(tab: MainTab): string {
  switch (tab) {
    case "catalog":
      return "Каталог";
    case "cart":
      return "Корзина";
    case "orders":
      return "Мои заказы";
    case "profile":
      return "Профиль";
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
    case "profile":
      return "";
  }
}
