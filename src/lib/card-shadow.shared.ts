import type { ViewStyle } from "react-native";

/** Тень карточек каталога — те же значения на корзине, заказах и похожих плитках. */
export const CARD_SHADOW: ViewStyle = {
  shadowColor: "#1B3A4B",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};
