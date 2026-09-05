import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import {
  formatOrderDate,
  formatPriceSomLabel,
  orderStatusLabel,
} from "../lib/orders-format.shared";
import type { OrdersScreenProps } from "./orders-screen.shared";

export function OrdersScreen(props: OrdersScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator
      refreshControl={
        <RefreshControl
          refreshing={props.refreshing}
          onRefresh={props.onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      {props.orders.length === 0 && !props.error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>☰</Text>
          <Text style={styles.muted}>Заказов пока нет</Text>
        </View>
      ) : (
        props.orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Заказ {order.id.slice(-8).toUpperCase()}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {orderStatusLabel(order.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>{formatOrderDate(order.createdAt)}</Text>
            {order.phone ? (
              <Text style={styles.itemLine}>Тел: {order.phone}</Text>
            ) : null}
            {order.address ? (
              <Text style={styles.itemLine}>Адрес: {order.address}</Text>
            ) : null}
            {order.comment ? (
              <Text style={styles.itemLine}>Комментарий: {order.comment}</Text>
            ) : null}
            {order.rejectionReason ? (
              <Text style={styles.errorInline}>
                Причина отклонения: {order.rejectionReason}
              </Text>
            ) : null}
            {order.items.map((item) => (
              <Text key={item.id} style={styles.itemLine}>
                {item.productName} · {item.quantity} ×{" "}
                {formatPriceSomLabel(item.priceCents)}
              </Text>
            ))}
            <Text style={styles.total}>
              Итого: {formatPriceSomLabel(order.totalCents)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: 12,
      paddingBottom: 24,
      gap: 10,
    },
    error: {
      color: colors.error,
    },
    errorInline: {
      color: colors.error,
      fontSize: 13,
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
    card: {
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 6,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 8,
    },
    cardTitle: {
      flex: 1,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.screenBackground,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    date: {
      fontSize: 13,
      color: colors.textMuted,
    },
    itemLine: {
      fontSize: 13,
      color: colors.textMuted,
    },
    total: {
      marginTop: 4,
      fontWeight: "700",
      color: colors.accent,
    },
  });
}
