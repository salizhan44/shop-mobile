import { useMemo, useState } from "react";
import { Dimensions, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { filterProductsBySearch } from "../lib/catalog-search.shared";
import { APP_THEME } from "../lib/app-theme.shared";
import type { ProductPublic } from "../lib/api";
import { formatPriceSomLabel } from "../lib/orders-format.shared";
import type { CatalogScreenProps } from "./catalog-screen.shared";

const GRID_PADDING = 8;
const GRID_GAP = 8;
const CARD_WIDTH =
  (Dimensions.get("window").width - GRID_PADDING * 2 - GRID_GAP) / 2;

export function CatalogScreen(props: CatalogScreenProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductPublic | null>(
    null,
  );

  const visibleProducts = useMemo(
    () => filterProductsBySearch(props.products, props.searchApplied),
    [props.products, props.searchApplied],
  );

  function onAddFromModal(productId: string) {
    props.onAdd(productId);
  }

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="never"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {props.catalogError ? (
          <Text style={styles.error}>{props.catalogError}</Text>
        ) : null}
        {visibleProducts.length === 0 && !props.catalogError ? (
          <Text style={styles.muted}>
            {props.searchApplied.trim().length > 0
              ? "Ничего не найдено. Измените запрос или сбросьте поиск."
              : "Товаров пока нет. Их добавят на сайте."}
          </Text>
        ) : (
          <View style={styles.grid}>
            {visibleProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => setSelectedProduct(product)}
                style={({ pressed }) => [
                  styles.card,
                  pressed ? styles.cardPressed : null,
                ]}
              >
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>▦</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.price}>
                  {formatPriceSomLabel(product.priceCents)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <ProductDetailModal
        product={selectedProduct}
        adding={
          selectedProduct !== null &&
          props.addingProductId === selectedProduct.id
        }
        onClose={() => setSelectedProduct(null)}
        onAdd={onAddFromModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: GRID_PADDING,
    paddingBottom: 24,
  },
  muted: {
    color: APP_THEME.textMuted,
    paddingHorizontal: 4,
  },
  error: {
    color: APP_THEME.error,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: 8,
    backgroundColor: APP_THEME.cardBackground,
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
    gap: 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: APP_THEME.screenBackground,
    borderWidth: 1,
    borderColor: APP_THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 32,
    color: APP_THEME.textMuted,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: APP_THEME.textPrimary,
    lineHeight: 16,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: APP_THEME.accent,
  },
});
