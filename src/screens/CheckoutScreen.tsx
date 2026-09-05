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
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import { formatPriceSomLabel } from "../lib/orders-format.shared";
import type { CheckoutScreenProps } from "./checkout-screen.shared";

export function CheckoutScreen(props: CheckoutScreenProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(props.initialAddress ?? "");
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
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
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
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Text style={styles.label}>Адрес</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Город, улица, дом, квартира"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Комментарий</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Необязательно"
          placeholderTextColor={colors.textMuted}
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

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.screenBackground,
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
      color: colors.textPrimary,
    },
    card: {
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 4,
    },
    cardTitle: {
      fontWeight: "600",
      color: colors.textPrimary,
    },
    muted: {
      color: colors.textMuted,
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
      color: colors.textMuted,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.accent,
    },
    label: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.cardBackground,
      color: colors.textPrimary,
    },
    textarea: {
      minHeight: 88,
      textAlignVertical: "top",
    },
    error: {
      color: colors.error,
      marginTop: 4,
    },
    footer: {
      padding: 16,
      backgroundColor: colors.cardBackground,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    button: {
      backgroundColor: colors.buttonBackground,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: "700",
      fontSize: 16,
    },
  });
}
