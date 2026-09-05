import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import { formatPriceSomLabel } from "../lib/orders-format.shared";
import type { CartScreenProps } from "./cart-screen.shared";

export function CartScreen(props: CartScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const itemCount = props.cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="never"
        keyboardDismissMode="on-drag"
      >
        {props.cart.items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◫</Text>
            <Text style={styles.muted}>Корзина пустая</Text>
            <Text style={styles.mutedSmall}>Добавьте товары из каталога</Text>
          </View>
        ) : (
          props.cart.items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>▦</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.price}>
                    {formatPriceSomLabel(item.priceCents)}
                  </Text>
                  <Text style={styles.lineTotal}>
                    {formatPriceSomLabel(item.lineTotalCents)}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <Pressable
                  onPress={() => props.onDecrease(item.id, item.quantity)}
                  disabled={props.busyItemId === item.id}
                  style={styles.qtyButton}
                >
                  <Text style={styles.qtyButtonText}>−</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Pressable
                  onPress={() => props.onIncrease(item.id, item.quantity)}
                  disabled={props.busyItemId === item.id}
                  style={styles.qtyButton}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
                <Pressable
                  onPress={() => props.onRemove(item.id)}
                  disabled={props.busyItemId === item.id}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Убрать</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {props.cart.items.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Итого ({itemCount} шт.)
            </Text>
            <Text style={styles.totalValue}>
              {formatPriceSomLabel(props.cart.totalCents)}
            </Text>
          </View>
          <Pressable
            onPress={props.onOpenCheckout}
            disabled={props.busyItemId !== null}
            style={styles.checkoutButton}
          >
            <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    error: {
      color: colors.error,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: 12,
      paddingBottom: 24,
      gap: 10,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 48,
      gap: 8,
    },
    emptyIcon: {
      fontSize: 40,
      color: colors.textMuted,
    },
    muted: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    mutedSmall: {
      color: colors.textMuted,
      fontSize: 14,
    },
    card: {
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 10,
    },
    cardTop: {
      flexDirection: "row",
      gap: 12,
    },
    placeholder: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.screenBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    placeholderText: {
      fontSize: 24,
      color: colors.textMuted,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontWeight: "700",
      color: colors.textPrimary,
    },
    price: {
      color: colors.textMuted,
      fontSize: 13,
    },
    lineTotal: {
      color: colors.accent,
      fontWeight: "700",
      fontSize: 15,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    qtyButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.screenBackground,
    },
    qtyButtonText: {
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    qtyValue: {
      minWidth: 24,
      textAlign: "center",
      fontWeight: "700",
      color: colors.textPrimary,
    },
    removeButton: {
      marginLeft: "auto",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    removeButtonText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    footer: {
      padding: 12,
      paddingBottom: 8,
      backgroundColor: colors.cardBackground,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: 10,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      color: colors.textMuted,
      fontSize: 14,
    },
    totalValue: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.accent,
    },
    checkoutButton: {
      backgroundColor: colors.buttonBackground,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    checkoutButtonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
