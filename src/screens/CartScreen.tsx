import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { APP_THEME } from "../lib/app-theme.shared";
import type { CartScreenProps } from "./cart-screen.shared";

export function CartScreen(props: CartScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Pressable onPress={props.onBack}>
        <Text style={styles.link}>К каталогу</Text>
      </Pressable>
      <Text style={styles.title}>Корзина</Text>
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      <ScrollView style={styles.list}>
        {props.cart.items.length === 0 ? (
          <Text style={styles.muted}>Корзина пустая.</Text>
        ) : (
          props.cart.items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.muted}>
                {(item.priceCents / 100).toFixed(2)} ₽ × {item.quantity} ={" "}
                {(item.lineTotalCents / 100).toFixed(2)} ₽
              </Text>
              <View style={styles.row}>
                <Pressable
                  onPress={() => props.onDecrease(item.id, item.quantity)}
                  disabled={props.busyItemId === item.id}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>−</Text>
                </Pressable>
                <Pressable
                  onPress={() => props.onIncrease(item.id, item.quantity)}
                  disabled={props.busyItemId === item.id}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>+</Text>
                </Pressable>
                <Pressable
                  onPress={() => props.onRemove(item.id)}
                  disabled={props.busyItemId === item.id}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Убрать</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <Text style={styles.total}>
        Итого: {(props.cart.totalCents / 100).toFixed(2)} ₽
      </Text>
      {props.cart.items.length > 0 ? (
        <Pressable
          onPress={props.onCheckout}
          disabled={props.checkoutPending || props.busyItemId !== null}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {props.checkoutPending ? "Оформляем…" : "Оформить заказ"}
          </Text>
        </Pressable>
      ) : null}
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
  link: { color: APP_THEME.link },
  error: { color: APP_THEME.error },
  list: { marginTop: 8 },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: APP_THEME.cardBackground,
  },
  cardTitle: { fontWeight: "600", color: APP_THEME.textPrimary },
  secondaryButton: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: { color: APP_THEME.textPrimary },
  button: {
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: APP_THEME.buttonText },
  total: { fontWeight: "600", fontSize: 16, color: APP_THEME.textPrimary },
});
