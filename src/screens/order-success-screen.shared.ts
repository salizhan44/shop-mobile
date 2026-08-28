import type { OrderPublic } from "../lib/api";

export type OrderSuccessScreenProps = {
  order: OrderPublic;
  onBackToCatalog: () => void;
  onOpenOrders: () => void;
};
