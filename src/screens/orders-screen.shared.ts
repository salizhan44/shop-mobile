import type { OrderPublic } from "../lib/api";

export type OrdersScreenProps = {
  orders: OrderPublic[];
  error: string;
  refreshing: boolean;
  onRefresh: () => void;
};
