import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { CatalogScreenProps } from "./catalog-screen.shared";

export function CatalogScreen(props: CatalogScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Каталог</Text>
      <Text style={styles.muted}>{props.customerName}</Text>
      <View style={styles.row}>
        <Pressable onPress={props.onLogout} style={styles.secondaryButton}>
          <Text>Выйти</Text>
        </Pressable>
        <Pressable onPress={props.onOpenCart} style={styles.secondaryButton}>
          <Text>Корзина</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.list}>
        {props.catalogError ? (
          <Text style={styles.error}>{props.catalogError}</Text>
        ) : null}
        {props.products.length === 0 && !props.catalogError ? (
          <Text style={styles.muted}>Товаров пока нет. Их добавят на сайте.</Text>
        ) : (
          props.products.map((product) => (
            <View key={product.id} style={styles.card}>
              <Text style={styles.cardTitle}>{product.name}</Text>
              {product.description ? (
                <Text style={styles.muted}>{product.description}</Text>
              ) : null}
              <Text style={styles.muted}>
                {(product.priceCents / 100).toFixed(2)} ₽
              </Text>
              <Pressable
                onPress={() => props.onAdd(product.id)}
                disabled={props.addingProductId === product.id}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {props.addingProductId === product.id
                    ? "Добавляем…"
                    : "В корзину"}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64, gap: 12 },
  title: { fontSize: 24, fontWeight: "600" },
  muted: { color: "#52525b" },
  row: { flexDirection: "row", gap: 8 },
  button: {
    marginTop: 8,
    backgroundColor: "#18181b",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff" },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  error: { color: "#b91c1c" },
  list: { marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  cardTitle: { fontWeight: "600" },
});
