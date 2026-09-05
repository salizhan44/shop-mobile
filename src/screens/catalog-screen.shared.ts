import type { ProductPublic } from "../lib/api";

export type CatalogScreenProps = {
  products: ProductPublic[];
  catalogError: string;
  addingProductId: string | null;
  searchApplied: string;
  favoriteIds: readonly string[];
  onAdd: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
};
