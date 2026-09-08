import type { CategoryOptionPublic, ProductPublic } from "../lib/api";
import type { CatalogFilterApplied } from "../lib/catalog-search.shared";

export type CatalogScreenProps = {
  products: ProductPublic[];
  catalogError: string;
  addingProductId: string | null;
  searchApplied: string;
  catalogFilter: CatalogFilterApplied;
  favoriteIds: readonly string[];
  /** Категории для быстрых вкладок; если нет — вкладки скрыты. */
  categories?: readonly CategoryOptionPublic[];
  onSelectCategoryId?: (categoryId: string | null) => void;
  /** Промо-карусель; в избранном выключена. */
  showPromoSlider?: boolean;
  onAdd: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
};
