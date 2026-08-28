import type { ProductPublic } from "../lib/api";

export type CatalogScreenProps = {
  customerName: string;
  products: ProductPublic[];
  catalogError: string;
  addingProductId: string | null;
  onLogout: () => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenSupport: () => void;
  onAdd: (productId: string) => void;
};
