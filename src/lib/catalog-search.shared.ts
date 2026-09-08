import type { CategoryOptionPublic, ProductPublic } from "./api";

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function isSubsequenceMatch(text: string, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalizedText = text.toLowerCase();
  let queryIndex = 0;

  for (
    let textIndex = 0;
    textIndex < normalizedText.length && queryIndex < query.length;
    textIndex += 1
  ) {
    if (normalizedText[textIndex] === query[queryIndex]) {
      queryIndex += 1;
    }
  }

  return queryIndex === query.length;
}

export type CatalogFilterApplied = {
  categoryId: string | null;
  subcategoryId: string | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
};

export const EMPTY_CATALOG_FILTER: CatalogFilterApplied = {
  categoryId: null,
  subcategoryId: null,
  minPriceCents: null,
  maxPriceCents: null,
};

/** Быстрые вкладки категорий под каруселью. */
export const CATALOG_QUICK_CATEGORY_NAMES = [
  "МУКА",
  "МАКАРОНЫ",
  "ЛАПША",
] as const;

const MISSING_CATEGORY_PREFIX = "__missing__:";

/** Id-заглушка, если категории ещё нет в API — у каждого имени своя. */
export function missingCategorySentinel(name: string): string {
  return `${MISSING_CATEGORY_PREFIX}${name.trim().toLowerCase()}`;
}

export function isMissingCategorySentinel(categoryId: string | null): boolean {
  return (
    typeof categoryId === "string" &&
    categoryId.startsWith(MISSING_CATEGORY_PREFIX)
  );
}

export function resolveQuickCategoryTargetId(
  categories: readonly CategoryOptionPublic[],
  name: string,
): string {
  return findCategoryIdByName(categories, name) ?? missingCategorySentinel(name);
}

export function findCategoryIdByName(
  categories: readonly CategoryOptionPublic[],
  name: string,
): string | null {
  const normalized = name.trim().toLowerCase();
  const exact = categories.find(
    (category) => category.name.trim() === name.trim(),
  );
  if (exact) {
    return exact.id;
  }
  const match = categories.find(
    (category) => category.name.trim().toLowerCase() === normalized,
  );
  return match?.id ?? null;
}

export function isCatalogFilterActive(filter: CatalogFilterApplied): boolean {
  const hasRealCategory =
    filter.categoryId !== null && !isMissingCategorySentinel(filter.categoryId);
  return (
    hasRealCategory ||
    filter.subcategoryId !== null ||
    filter.minPriceCents !== null ||
    filter.maxPriceCents !== null
  );
}

export function parsePriceSomToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isFinite(cents) || cents < 0) {
    return null;
  }
  return cents;
}

export function formatCentsToSomInput(cents: number | null): string {
  if (cents === null) {
    return "";
  }
  const som = cents / 100;
  return Number.isInteger(som) ? String(som) : som.toFixed(2);
}

export function filterProductsBySearch(
  products: ProductPublic[],
  query: string,
): ProductPublic[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return products;
  }

  return products.filter((product) =>
    isSubsequenceMatch(product.name, normalized),
  );
}

export function filterProductsByCatalog(
  products: ProductPublic[],
  query: string,
  filter: CatalogFilterApplied,
): ProductPublic[] {
  return filterProductsBySearch(products, query).filter((product) => {
    if (filter.categoryId && product.categoryId !== filter.categoryId) {
      return false;
    }
    if (
      filter.subcategoryId &&
      product.subcategoryId !== filter.subcategoryId
    ) {
      return false;
    }
    if (
      filter.minPriceCents !== null &&
      product.priceCents < filter.minPriceCents
    ) {
      return false;
    }
    if (
      filter.maxPriceCents !== null &&
      product.priceCents > filter.maxPriceCents
    ) {
      return false;
    }
    return true;
  });
}

export function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 1).toUpperCase();
  }
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
}
