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

export const CATALOG_SORT_ORDERS = [
  "default",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export type CatalogSortOrder = (typeof CATALOG_SORT_ORDERS)[number];

export const DEFAULT_CATALOG_SORT: CatalogSortOrder = "default";

export function resolveCatalogSort(sort: unknown): CatalogSortOrder {
  if (
    sort === "default" ||
    sort === "price_asc" ||
    sort === "price_desc" ||
    sort === "name_asc" ||
    sort === "name_desc"
  ) {
    return sort;
  }
  return DEFAULT_CATALOG_SORT;
}

export type CatalogFilterApplied = {
  categoryId: string | null;
  subcategoryId: string | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  sort: CatalogSortOrder;
};

export const EMPTY_CATALOG_FILTER: CatalogFilterApplied = {
  categoryId: null,
  subcategoryId: null,
  minPriceCents: null,
  maxPriceCents: null,
  sort: DEFAULT_CATALOG_SORT,
};

export function catalogSortLabel(sort: CatalogSortOrder): string {
  switch (sort) {
    case "default":
      return "По умолчанию";
    case "price_asc":
      return "Сначала дешёвые";
    case "price_desc":
      return "Сначала дорогие";
    case "name_asc":
      return "А–Я";
    case "name_desc":
      return "Я–А";
  }
}

export function isCatalogSortActive(filter: CatalogFilterApplied): boolean {
  return resolveCatalogSort(filter.sort) !== DEFAULT_CATALOG_SORT;
}

export function sortCatalogProducts(
  products: readonly ProductPublic[],
  sort: CatalogSortOrder,
): ProductPublic[] {
  if (sort === DEFAULT_CATALOG_SORT) {
    return products.slice();
  }

  const ranked = products.map((product, index) => ({ product, index }));
  ranked.sort((left, right) => {
    let compared = 0;
    if (sort === "price_asc" || sort === "price_desc") {
      compared = left.product.priceCents - right.product.priceCents;
      if (sort === "price_desc") {
        compared = -compared;
      }
    } else {
      compared = left.product.name.localeCompare(right.product.name, "ru", {
        numeric: true,
        sensitivity: "base",
      });
      if (sort === "name_desc") {
        compared = -compared;
      }
    }
    return compared !== 0 ? compared : left.index - right.index;
  });
  return ranked.map((item) => item.product);
}

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
  const filtered = filterProductsBySearch(products, query).filter((product) => {
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
  return sortCatalogProducts(filtered, resolveCatalogSort(filter.sort));
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
