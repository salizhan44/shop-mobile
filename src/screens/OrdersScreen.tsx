import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { APP_THEME } from "../lib/app-theme.shared";
import {
  formatOrderDate,
  formatPriceRubles,
  orderStatusLabel,
} from "../lib/orders-format.shared";
import type { OrdersScreenProps } from "./orders-screen.shared";

export function OrdersScreen(props: OrdersScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Pressable onPress={props.onBack}>
        <Text style={styles.link}>К каталогу</Text>
      </Pressable>
      <Text style={styles.title}>Мои заказы</Text>
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      <ScrollView style={styles.list}>
        {props.orders.length === 0 && !props.error ? (
          <Text style={styles.muted}>Заказов пока нет.</Text>
        ) : (
          props.orders.map((order) => (
            <View key={order.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                Заказ {order.id.slice(-8).toUpperCase()}
              </Text>
              <Text style={styles.muted}>{formatOrderDate(order.createdAt)}</Text>
              <Text style={styles.status}>{orderStatusLabel(order.status)}</Text>
              {order.rejectionReason ? (
                <Text style={styles.error}>
                  Причина отклонения: {order.rejectionReason}
                </Text>
              ) : null}
              {order.items.map((item) => (
                <Text key={item.id} style={styles.muted}>
                  {item.productName} · {item.quantity} ×{" "}
                  {formatPriceRubles(item.priceCents)} ₽
                </Text>
              ))}
              <Text style={styles.total}>
                Итого: {formatPriceRubles(order.totalCents)} ₽
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
    gap: 12,
    backgroundColor: APP_THEME.screenBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: APP_THEME.textPrimary,
  },
  muted: { color: APP_THEME.textMuted },
  status: { color: APP_THEME.textPrimary, fontWeight: "500" },
  link: { color: APP_THEME.link },
  error: { color: APP_THEME.error },
  list: { marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: APP_THEME.cardBackground,
    gap: 4,
  },
  cardTitle: { fontWeight: "600", color: APP_THEME.textPrimary },
  total: { marginTop: 4, fontWeight: "600", color: APP_THEME.textPrimary },
});
