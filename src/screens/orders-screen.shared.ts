import type { OrderPublic } from "../lib/api";

export type OrdersScreenProps = {
  orders: OrderPublic[];
  error: string;
  hasUpdates: boolean;
  refreshPending: boolean;
  onBack: () => void;
  onRefresh: () => void;
};
