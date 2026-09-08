import type { CartPublic, PromoQuotePublic } from "../lib/api";

export type CheckoutScreenProps = {
  cart: CartPublic;
  error: string;
  pending: boolean;
  initialAddress?: string;
  onBack: () => void;
  onPreviewPromo: (code: string) => Promise<PromoQuotePublic>;
  onSubmit: (input: {
    phone: string;
    address: string;
    comment: string;
    promoCode: string;
  }) => Promise<void>;
};
