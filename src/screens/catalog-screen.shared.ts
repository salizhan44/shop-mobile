import type { ProductPublic } from "../lib/api";
import type { CatalogFilterApplied } from "../lib/catalog-search.shared";

export type CatalogScreenProps = {
  products: ProductPublic[];
  catalogError: string;
  addingProductId: string | null;
  searchApplied: string;
  catalogFilter: CatalogFilterApplied;
  favoriteIds: readonly string[];
  onAdd: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
};
