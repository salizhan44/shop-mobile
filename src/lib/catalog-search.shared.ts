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
