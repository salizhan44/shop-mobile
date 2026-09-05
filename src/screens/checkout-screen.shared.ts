import type { CartPublic } from "../lib/api";

export type CheckoutScreenProps = {
  cart: CartPublic;
  error: string;
  pending: boolean;
  initialAddress?: string;
  onBack: () => void;
  onSubmit: (input: {
    phone: string;
    address: string;
    comment: string;
  }) => Promise<void>;
};
