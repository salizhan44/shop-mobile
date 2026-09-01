import type { ProductPublic } from "../lib/api";

export type CatalogScreenProps = {
  products: ProductPublic[];
  catalogError: string;
  addingProductId: string | null;
  searchApplied: string;
  onAdd: (productId: string) => void;
};
