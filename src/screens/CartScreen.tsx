import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
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
                  <Text>−</Text>
                </Pressable>
                <Pressable
                  onPress={() => props.onIncrease(item.id, item.quantity)}
                  disabled={props.busyItemId === item.id}
                  style={styles.secondaryButton}
                >
                  <Text>+</Text>
                </Pressable>
                <Pressable
                  onPress={() => props.onRemove(item.id)}
                  disabled={props.busyItemId === item.id}
                  style={styles.secondaryButton}
                >
                  <Text>Убрать</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <Text style={styles.total}>
        Итого: {(props.cart.totalCents / 100).toFixed(2)} ₽
      </Text>
      <Text style={styles.muted}>Оформление заказа — на следующем шаге.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64, gap: 12 },
  title: { fontSize: 24, fontWeight: "600" },
  muted: { color: "#52525b" },
  link: { color: "#2563eb" },
  error: { color: "#b91c1c" },
  list: { marginTop: 8 },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  cardTitle: { fontWeight: "600" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  total: { fontWeight: "600", fontSize: 16 },
});
