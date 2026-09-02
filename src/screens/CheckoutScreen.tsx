import { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppHeader } from "../components/AppHeader";
import { APP_THEME } from "../lib/app-theme.shared";
import { formatPriceSomLabel } from "../lib/orders-format.shared";
import type { CheckoutScreenProps } from "./checkout-screen.shared";

export function CheckoutScreen(props: CheckoutScreenProps) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  const itemCount = props.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  async function onSubmit() {
    Keyboard.dismiss();
    setFormError("");
    try {
      await props.onSubmit({ phone, address, comment });
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Не удалось оформить заказ",
      );
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AppHeader title="Оформление" onBack={props.onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.sectionTitle}>Ваш заказ</Text>
        {props.cart.items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.muted}>
              {formatPriceSomLabel(item.priceCents)} × {item.quantity} ={" "}
              {formatPriceSomLabel(item.lineTotalCents)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого ({itemCount} шт.)</Text>
          <Text style={styles.totalValue}>
            {formatPriceSomLabel(props.cart.totalCents)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Доставка</Text>
        <Text style={styles.label}>Телефон</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+996 700 000 000"
          placeholderTextColor={APP_THEME.textMuted}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Text style={styles.label}>Адрес</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Город, улица, дом, квартира"
          placeholderTextColor={APP_THEME.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Комментарий</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Необязательно"
          placeholderTextColor={APP_THEME.textMuted}
          multiline
          style={[styles.input, styles.textarea]}
        />

        {formError || props.error ? (
          <Text style={styles.error}>{formError || props.error}</Text>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Pressable
          onPress={onSubmit}
          disabled={props.pending}
          style={[styles.button, props.pending ? styles.buttonDisabled : null]}
        >
          <Text style={styles.buttonText}>
            {props.pending ? "Оформляем…" : "Оформить заказ"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: APP_THEME.screenBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "700",
    color: APP_THEME.textPrimary,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: APP_THEME.cardBackground,
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
    gap: 4,
  },
  cardTitle: {
    fontWeight: "600",
    color: APP_THEME.textPrimary,
  },
  muted: {
    color: APP_THEME.textMuted,
    fontSize: 13,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  totalLabel: {
    color: APP_THEME.textMuted,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: APP_THEME.accent,
  },
  label: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: APP_THEME.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: APP_THEME.cardBackground,
    color: APP_THEME.textPrimary,
  },
  textarea: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  error: {
    color: APP_THEME.error,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: APP_THEME.cardBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: APP_THEME.border,
  },
  button: {
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: APP_THEME.buttonText,
    fontWeight: "700",
    fontSize: 16,
  },
});
