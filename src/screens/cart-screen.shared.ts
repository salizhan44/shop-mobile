import type { CartPublic } from "../lib/api";

export type CartScreenProps = {
  cart: CartPublic;
  error: string;
  busyItemId: string | null;
  onBack: () => void;
  onIncrease: (itemId: string, quantity: number) => void;
  onDecrease: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};
