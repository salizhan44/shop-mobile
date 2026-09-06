import type { CategoryOptionPublic } from "../lib/api";
import type { CatalogFilterApplied } from "../lib/catalog-search.shared";

export type CatalogFilterModalProps = {
  visible: boolean;
  categories: CategoryOptionPublic[];
  initialFilter: CatalogFilterApplied;
  onClose: () => void;
  onApply: (filter: CatalogFilterApplied) => void;
};
