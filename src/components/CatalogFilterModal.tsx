import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import {
  formatCentsToSomInput,
  parsePriceSomToCents,
  type CatalogFilterApplied,
} from "../lib/catalog-search.shared";
import type { CatalogFilterModalProps } from "./catalog-filter-modal.shared";

export function CatalogFilterModal(props: CatalogFilterModalProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [minPriceSom, setMinPriceSom] = useState("");
  const [maxPriceSom, setMaxPriceSom] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!props.visible) {
      return;
    }
    setCategoryId(props.initialFilter.categoryId);
    setSubcategoryId(props.initialFilter.subcategoryId);
    setMinPriceSom(formatCentsToSomInput(props.initialFilter.minPriceCents));
    setMaxPriceSom(formatCentsToSomInput(props.initialFilter.maxPriceCents));
    setFormError("");
  }, [props.visible, props.initialFilter]);

  const selectedCategory = useMemo(
    () => props.categories.find((item) => item.id === categoryId) ?? null,
    [props.categories, categoryId],
  );

  function onClear() {
    setCategoryId(null);
    setSubcategoryId(null);
    setMinPriceSom("");
    setMaxPriceSom("");
    setFormError("");
  }

  function onApply() {
    const minPriceCents = parsePriceSomToCents(minPriceSom);
    const maxPriceCents = parsePriceSomToCents(maxPriceSom);
    if (minPriceSom.trim() && minPriceCents === null) {
      setFormError("Минимальная цена — число, например 100 или 99.50");
      return;
    }
    if (maxPriceSom.trim() && maxPriceCents === null) {
      setFormError("Максимальная цена — число, например 500 или 199.90");
      return;
    }
    if (
      minPriceCents !== null &&
      maxPriceCents !== null &&
      minPriceCents > maxPriceCents
    ) {
      setFormError("Минимальная цена не больше максимальной");
      return;
    }

    const next: CatalogFilterApplied = {
      categoryId,
      subcategoryId: categoryId ? subcategoryId : null,
      minPriceCents,
      maxPriceCents,
    };
    props.onApply(next);
  }

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={props.onClose}
    >
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={props.onClose}
            style={styles.closeButton}
            accessibilityLabel="Закрыть"
            hitSlop={8}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.title}>Фильтр</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Категория</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => {
                setCategoryId(null);
                setSubcategoryId(null);
              }}
              style={[
                styles.chip,
                categoryId === null ? styles.chipActive : null,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  categoryId === null ? styles.chipTextActive : null,
                ]}
              >
                Все
              </Text>
            </Pressable>
            {props.categories.map((category) => {
              const active = categoryId === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    setCategoryId(category.id);
                    setSubcategoryId(null);
                  }}
                  style={[styles.chip, active ? styles.chipActive : null]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active ? styles.chipTextActive : null,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedCategory && selectedCategory.subcategories.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Подкатегория</Text>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => setSubcategoryId(null)}
                  style={[
                    styles.chip,
                    subcategoryId === null ? styles.chipActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      subcategoryId === null ? styles.chipTextActive : null,
                    ]}
                  >
                    Все
                  </Text>
                </Pressable>
                {selectedCategory.subcategories.map((subcategory) => {
                  const active = subcategoryId === subcategory.id;
                  return (
                    <Pressable
                      key={subcategory.id}
                      onPress={() => setSubcategoryId(subcategory.id)}
                      style={[styles.chip, active ? styles.chipActive : null]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active ? styles.chipTextActive : null,
                        ]}
                      >
                        {subcategory.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Цена, сом</Text>
          <View style={styles.priceRow}>
            <TextInput
              value={minPriceSom}
              onChangeText={setMinPriceSom}
              placeholder="От"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={styles.priceInput}
            />
            <Text style={styles.priceDash}>—</Text>
            <TextInput
              value={maxPriceSom}
              onChangeText={setMaxPriceSom}
              placeholder="До"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={styles.priceInput}
            />
          </View>
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={onClear} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Очистить</Text>
          </Pressable>
          <Pressable onPress={onApply} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Применить</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingBottom: 8,
      gap: 8,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    closeText: {
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    headerSpacer: {
      width: 40,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 12,
    },
    sectionTitle: {
      marginTop: 8,
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    chipActive: {
      backgroundColor: colors.buttonBackground,
      borderColor: colors.buttonBackground,
    },
    chipText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    chipTextActive: {
      color: colors.buttonText,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    priceInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.cardBackground,
      color: colors.textPrimary,
      fontSize: 15,
    },
    priceDash: {
      color: colors.textMuted,
      fontSize: 16,
    },
    error: {
      color: colors.error,
      fontSize: 13,
    },
    footer: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.screenBackground,
    },
    secondaryButtonText: {
      color: colors.textPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    primaryButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: colors.buttonBackground,
    },
    primaryButtonText: {
      color: colors.buttonText,
      fontWeight: "700",
      fontSize: 15,
    },
  });
}
