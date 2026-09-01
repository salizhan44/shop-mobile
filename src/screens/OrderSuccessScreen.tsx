import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { APP_THEME } from "../lib/app-theme.shared";
import {
  formatPriceSomLabel,
  orderStatusLabel,
} from "../lib/orders-format.shared";
import type { OrderSuccessScreenProps } from "./order-success-screen.shared";

export function OrderSuccessScreen(props: OrderSuccessScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>✓</Text>
        <Text style={styles.title}>Заказ оформлен</Text>
        <Text style={styles.muted}>Номер: {props.order.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.muted}>
          Статус: {orderStatusLabel(props.order.status)}
        </Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {props.order.items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.productName}</Text>
            <Text style={styles.muted}>
              {formatPriceSomLabel(item.priceCents)} × {item.quantity} ={" "}
              {formatPriceSomLabel(item.lineTotalCents)}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <Text style={styles.total}>
          Итого: {formatPriceSomLabel(props.order.totalCents)}
        </Text>
        <Text style={styles.hint}>
          Склад проверит заказ. Статус — во вкладке «Мои заказы».
        </Text>
        <Pressable onPress={props.onOpenOrders} style={styles.button}>
          <Text style={styles.buttonText}>Мои заказы</Text>
        </Pressable>
        <Pressable onPress={props.onBackToCatalog} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>В каталог</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.screenBackground,
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 6,
  },
  heroIcon: {
    width: 56,
    height: 56,
    lineHeight: 56,
    textAlign: "center",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: 28,
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: APP_THEME.textPrimary,
  },
  muted: {
    color: APP_THEME.textMuted,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: APP_THEME.cardBackground,
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
  },
  cardTitle: {
    fontWeight: "600",
    color: APP_THEME.textPrimary,
  },
  footer: {
    padding: 16,
    gap: 10,
    backgroundColor: APP_THEME.cardBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: APP_THEME.border,
  },
  total: {
    fontWeight: "700",
    fontSize: 18,
    color: APP_THEME.accent,
  },
  hint: {
    color: APP_THEME.textMuted,
    fontSize: 13,
  },
  button: {
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: APP_THEME.buttonText,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: APP_THEME.textPrimary,
  },
});
