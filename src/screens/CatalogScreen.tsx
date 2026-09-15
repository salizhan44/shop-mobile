import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { filterProductsByCatalog, isCatalogFilterActive, CATALOG_QUICK_CATEGORY_NAMES, resolveQuickCategoryTargetId, isMissingCategorySentinel } from "../lib/catalog-search.shared";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import type { ProductPublic } from "../lib/api";
import { formatPriceSomLabel } from "../lib/orders-format.shared";
import { CARD_SHADOW } from "../lib/card-shadow.shared";
import { HeartIcon } from "../components/HeartIcon";
import { CatalogPromoSlider } from "../components/CatalogPromoSlider";
import { BOTTOM_TAB_BAR_CONTENT_INSET, useBottomTabBarContentInset } from "../components/BottomTabBar";
import type { CatalogScreenProps } from "./catalog-screen.shared";

const GRID_PADDING = 8 * 1.5;
const GRID_GAP = 9.6 * 1.5;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;
const CARD_RADIUS = 14 * 1.15;
const CARD_IMAGE_RADIUS = 9.8 * 1.15;

export function CatalogScreen(props: CatalogScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const tabBarInset = useBottomTabBarContentInset();
  const scrollRef = useRef<ScrollView>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductPublic | null>(
    null,
  );

  const visibleProducts = useMemo(
    () =>
      filterProductsByCatalog(
        props.products,
        props.searchApplied,
        props.catalogFilter,
      ),
    [props.products, props.searchApplied, props.catalogFilter],
  );

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }
    const fresh = props.products.find(
      (product) => product.id === selectedProduct.id,
    );
    if (!fresh) {
      setSelectedProduct(null);
      return;
    }
    if (
      fresh.name !== selectedProduct.name ||
      fresh.description !== selectedProduct.description ||
      fresh.priceCents !== selectedProduct.priceCents ||
      fresh.compareAtCents !== selectedProduct.compareAtCents ||
      fresh.imageUrl !== selectedProduct.imageUrl
    ) {
      setSelectedProduct(fresh);
    }
  }, [props.products, selectedProduct]);

  function openProduct(product: ProductPublic) {
    Keyboard.dismiss();
    setSelectedProduct(product);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  }

  function closeProduct() {
    setSelectedProduct(null);
  }

  const selectedAdding =
    selectedProduct !== null && props.addingProductId === selectedProduct.id;
  const selectedFavorite =
    selectedProduct !== null &&
    props.favoriteIds.includes(selectedProduct.id);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScrollBeginDrag={Keyboard.dismiss}
    >
      {selectedProduct ? (
        <View style={styles.detail}>
          <View style={styles.hero}>
            {selectedProduct.imageUrl ? (
              <Image
                source={{ uri: selectedProduct.imageUrl }}
                style={styles.heroImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.heroPlaceholder}>▦</Text>
            )}
            <Pressable
              onPress={closeProduct}
              style={styles.backButton}
              accessibilityLabel="Назад"
              hitSlop={8}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>
          </View>
          <View style={styles.detailBody}>
            <Text style={styles.detailName}>{selectedProduct.name}</Text>
            <View style={styles.detailPriceRow}>
              <View style={styles.detailPriceBlock}>
                {selectedProduct.compareAtCents ? (
                  <Text style={styles.detailPriceOld}>
                    {formatPriceSomLabel(selectedProduct.compareAtCents)}
                  </Text>
                ) : null}
                <Text style={styles.detailPrice}>
                  {formatPriceSomLabel(selectedProduct.priceCents)}
                </Text>
              </View>
              <Pressable
                onPress={() => props.onToggleFavorite(selectedProduct.id)}
                style={styles.detailFavoriteButton}
                accessibilityLabel="Избранное"
                hitSlop={8}
              >
                <HeartIcon
                  filled={selectedFavorite}
                  color={selectedFavorite ? colors.accent : colors.iconSoft}
                  size={24}
                />
              </Pressable>
              <Pressable
                onPress={() => props.onAdd(selectedProduct.id)}
                disabled={selectedAdding}
                style={({ pressed }) => [
                  styles.detailAddButton,
                  selectedAdding || pressed
                    ? styles.addButtonPressed
                    : null,
                ]}
                accessibilityLabel="Добавить в корзину"
              >
                <Text style={styles.detailAddButtonText}>
                  {selectedAdding ? "…" : "+"}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.detailDescription}>
              {selectedProduct.description.trim().length > 0
                ? selectedProduct.description
                : "Описание пока не добавлено."}
            </Text>
          </View>
          <Text style={styles.catalogSection}>Каталог</Text>
        </View>
      ) : props.showPromoSlider === false ? null : (
        <CatalogPromoSlider />
      )}

      {props.onSelectCategoryId ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => props.onSelectCategoryId?.(null)}
            style={[
              styles.categoryChip,
              props.catalogFilter.categoryId === null
                ? styles.categoryChipActive
                : null,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                props.catalogFilter.categoryId === null
                  ? styles.categoryChipTextActive
                  : null,
              ]}
            >
              ВСЕ
            </Text>
          </Pressable>
          {CATALOG_QUICK_CATEGORY_NAMES.map((name) => {
            const targetId = resolveQuickCategoryTargetId(
              props.categories ?? [],
              name,
            );
            const active = props.catalogFilter.categoryId === targetId;
            return (
              <Pressable
                key={name}
                onPress={() => props.onSelectCategoryId?.(targetId)}
                style={[
                  styles.categoryChip,
                  active ? styles.categoryChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active ? styles.categoryChipTextActive : null,
                  ]}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {props.catalogError ? (
        <Text style={styles.error}>{props.catalogError}</Text>
      ) : null}

      {visibleProducts.length === 0 && !props.catalogError ? (
        <Text style={styles.muted}>
          {props.searchApplied.trim().length > 0 ||
          isCatalogFilterActive(props.catalogFilter) ||
          isMissingCategorySentinel(props.catalogFilter.categoryId)
            ? "Ничего не найдено. Измените запрос, фильтр или сбросьте поиск."
            : "Товаров пока нет. Их добавят на сайте."}
        </Text>
      ) : (
        <View style={styles.grid}>
          {visibleProducts.map((product) => {
            const adding = props.addingProductId === product.id;
            const isOpen = selectedProduct?.id === product.id;
            return (
              <Pressable
                key={product.id}
                onPress={() => openProduct(product)}
                style={({ pressed }) => [
                  styles.card,
                  isOpen ? styles.cardOpen : null,
                  pressed ? styles.cardPressed : null,
                ]}
              >
                <View style={styles.imagePlaceholder}>
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.imagePlaceholderText}>▦</Text>
                  )}
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceBlock}>
                    {product.compareAtCents ? (
                      <Text style={styles.priceOld} numberOfLines={1}>
                        {formatPriceSomLabel(product.compareAtCents)}
                      </Text>
                    ) : null}
                    <Text style={styles.price} numberOfLines={1}>
                      {formatPriceSomLabel(product.priceCents)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => props.onToggleFavorite(product.id)}
                    hitSlop={6}
                    style={styles.favoriteButton}
                    accessibilityLabel="Избранное"
                  >
                    <HeartIcon
                      filled={props.favoriteIds.includes(product.id)}
                      color={
                        props.favoriteIds.includes(product.id)
                          ? colors.accent
                          : colors.iconSoft
                      }
                      size={20}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => props.onAdd(product.id)}
                    disabled={adding}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.addButton,
                      adding || pressed ? styles.addButtonPressed : null,
                    ]}
                    accessibilityLabel="Добавить в корзину"
                  >
                    <Text style={styles.addButtonText}>
                      {adding ? "…" : "+"}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    content: {
      paddingTop: 12 * 0.7,
      paddingBottom: BOTTOM_TAB_BAR_CONTENT_INSET,
    },
    categoryTabs: {
      flexGrow: 0,
      marginTop: 8 * 0.2,
      marginBottom: 10,
    },
    categoryTabsContent: {
      paddingHorizontal: GRID_PADDING,
      gap: 8,
      alignItems: "center",
    },
    categoryChip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: StyleSheet.hairlineWidth * 1.7,
      borderColor: colors.border,
      backgroundColor: "transparent",
    },
    categoryChipActive: {
      backgroundColor: "transparent",
      borderColor: colors.accent,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    categoryChipTextActive: {
      color: colors.accent,
    },
    detail: {
      marginBottom: 8,
    },
    hero: {
      width: SCREEN_WIDTH,
      aspectRatio: 1,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    heroImage: {
      width: "69%",
      height: "69%",
    },
    heroPlaceholder: {
      fontSize: 64,
      color: colors.textMuted,
    },
    backButton: {
      position: "absolute",
      top: 12,
      left: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    backButtonText: {
      fontSize: 28,
      lineHeight: 30,
      marginTop: -2,
      color: colors.textPrimary,
      fontWeight: "400",
    },
    detailBody: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
      gap: 10,
    },
    detailName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    detailPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    detailPriceBlock: {
      flex: 1,
      gap: 2,
    },
    detailPriceOld: {
      fontSize: 14,
      color: colors.textMuted,
      textDecorationLine: "line-through",
    },
    detailPrice: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.accent,
    },
    detailFavoriteButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    detailAddButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    detailAddButtonText: {
      color: colors.buttonText,
      fontSize: 28,
      fontWeight: "600",
      lineHeight: 30,
      marginTop: -2,
    },
    detailDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textPrimary,
    },
    catalogSection: {
      paddingHorizontal: GRID_PADDING,
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    muted: {
      color: colors.textMuted,
      paddingHorizontal: GRID_PADDING,
    },
    error: {
      color: colors.error,
      paddingHorizontal: GRID_PADDING,
      marginBottom: 8,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: GRID_GAP,
      paddingHorizontal: GRID_PADDING,
    },
    card: {
      width: CARD_WIDTH,
      borderRadius: CARD_RADIUS,
      padding: 8,
      backgroundColor: colors.cardBackground,
      ...CARD_SHADOW,
    },
    cardOpen: {
      opacity: 0.96,
    },
    cardPressed: {
      opacity: 0.92,
    },
    imagePlaceholder: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: CARD_IMAGE_RADIUS,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      overflow: "hidden",
    },
    cardImage: {
      width: "69%",
      height: "69%",
    },
    imagePlaceholderText: {
      fontSize: 32,
      color: colors.textMuted,
    },
    cardTitle: {
      fontSize: 15.6,
      fontWeight: "600",
      color: colors.textPrimary,
      lineHeight: 19.2,
      marginBottom: 6,
      minHeight: 38,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    priceBlock: {
      flex: 1,
      minWidth: 0,
    },
    priceOld: {
      fontSize: 12,
      color: colors.textMuted,
      textDecorationLine: "line-through",
    },
    price: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.accent,
    },
    favoriteButton: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    addButton: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    addButtonPressed: {
      opacity: 0.7,
    },
    addButtonText: {
      color: colors.buttonText,
      fontSize: 22,
      fontWeight: "600",
      lineHeight: 24,
      marginTop: -1,
    },
  });
}
