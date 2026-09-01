import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { APP_THEME } from "../lib/app-theme.shared";
import { formatPriceSomLabel } from "../lib/orders-format.shared";
import type { CatalogScreenProps } from "./catalog-screen.shared";

export function CatalogScreen(props: CatalogScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Каталог</Text>
      <Text style={styles.muted}>{props.customerName}</Text>
      <View style={styles.row}>
        <Pressable onPress={props.onLogout} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Выйти</Text>
        </Pressable>
        <Pressable onPress={props.onOpenCart} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Корзина</Text>
        </Pressable>
        <Pressable onPress={props.onOpenOrders} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Мои заказы</Text>
        </Pressable>
        <Pressable onPress={props.onOpenSupport} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Поддержка</Text>
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
                {formatPriceSomLabel(product.priceCents)}
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
  row: { flexDirection: "row", gap: 8 },
  button: {
    marginTop: 8,
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: { color: APP_THEME.buttonText },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: { color: APP_THEME.textPrimary },
  error: { color: APP_THEME.error },
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
});
