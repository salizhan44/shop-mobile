import type { ProductPublic } from "./api";

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

export function isCatalogFilterActive(filter: CatalogFilterApplied): boolean {
  return (
    filter.categoryId !== null ||
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
