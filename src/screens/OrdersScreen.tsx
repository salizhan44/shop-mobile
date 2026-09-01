import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RefreshWithUpdates } from "../components/RefreshWithUpdates";
import { APP_THEME } from "../lib/app-theme.shared";
import {
  formatOrderDate,
  formatPriceSomLabel,
  orderStatusLabel,
} from "../lib/orders-format.shared";
import type { OrdersScreenProps } from "./orders-screen.shared";

export function OrdersScreen(props: OrdersScreenProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator
    >
      <View style={styles.toolbar}>
        <RefreshWithUpdates
          hasUpdates={props.hasUpdates}
          onRefresh={props.onRefresh}
          pending={props.refreshPending}
        />
      </View>
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 12,
    paddingBottom: 24,
    gap: 10,
  },
  toolbar: {
    paddingBottom: 4,
  },
  error: {
    color: APP_THEME.error,
  },
  errorInline: {
    color: APP_THEME.error,
    fontSize: 13,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    color: APP_THEME.textMuted,
  },
  muted: {
    color: APP_THEME.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: APP_THEME.cardBackground,
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
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
    color: APP_THEME.textPrimary,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: APP_THEME.screenBackground,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: APP_THEME.textPrimary,
  },
  date: {
    fontSize: 13,
    color: APP_THEME.textMuted,
  },
  itemLine: {
    fontSize: 13,
    color: APP_THEME.textMuted,
  },
  total: {
    marginTop: 4,
    fontWeight: "700",
    color: APP_THEME.accent,
  },
});
