import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { APP_THEME } from "../lib/app-theme.shared";
import {
  formatPriceSomLabel,
  orderStatusLabel,
} from "../lib/orders-format.shared";
import type { OrderSuccessScreenProps } from "./order-success-screen.shared";

export function OrderSuccessScreen(props: OrderSuccessScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Заказ оформлен</Text>
      <Text style={styles.muted}>Номер: {props.order.id}</Text>
      <Text style={styles.muted}>
        Статус: {orderStatusLabel(props.order.status)}
      </Text>
      <ScrollView style={styles.list}>
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
      <Text style={styles.total}>
        Итого: {formatPriceSomLabel(props.order.totalCents)}
      </Text>
      <Text style={styles.muted}>
        Склад проверит заказ. Статус можно смотреть в «Мои заказы».
      </Text>
      <Pressable onPress={props.onOpenOrders} style={styles.button}>
        <Text style={styles.buttonText}>Мои заказы</Text>
      </Pressable>
      <Pressable onPress={props.onBackToCatalog} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>В каталог</Text>
      </Pressable>
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
  list: { marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: APP_THEME.cardBackground,
  },
  cardTitle: { fontWeight: "600", color: APP_THEME.textPrimary },
  total: { fontWeight: "600", fontSize: 16, color: APP_THEME.textPrimary },
  button: {
    marginTop: 8,
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: APP_THEME.buttonText },
  secondaryButton: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: { color: APP_THEME.textPrimary },
});
