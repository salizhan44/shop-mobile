import type { CartPublic, PromoQuotePublic } from "../lib/api";

export const CHECKOUT_PAY_MODES = ["money", "points_part", "points_max"] as const;

export type CheckoutPayMode = (typeof CHECKOUT_PAY_MODES)[number];

export function checkoutPayModeLabel(mode: CheckoutPayMode): string {
  switch (mode) {
    case "money":
      return "Только деньгами";
    case "points_part":
      return "Часть баллов";
    case "points_max":
      return "Максимум баллов";
  }
}

export type CheckoutScreenProps = {
  cart: CartPublic;
  error: string;
  pending: boolean;
  initialAddress?: string;
  loyaltyPoints: number;
  onBack: () => void;
  onPreviewPromo: (code: string) => Promise<PromoQuotePublic>;
  onSubmit: (input: {
    phone: string;
    address: string;
    comment: string;
    promoCode: string;
    pointsToSpend: number;
  }) => Promise<void>;
};
