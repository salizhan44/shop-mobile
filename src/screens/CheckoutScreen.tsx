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
import { CARD_SHADOW } from "../lib/card-shadow.shared";
import {
  CHECKOUT_PAY_MODES,
  checkoutPayModeLabel,
  type CheckoutPayMode,
  type CheckoutScreenProps,
} from "./checkout-screen.shared";
import {
  clampLoyaltyPointsToSpend,
  maxLoyaltyPointsForPayable,
  payableAfterLoyaltyCents,
} from "../lib/loyalty.shared";
import type { PromoQuotePublic } from "../lib/api";

export function CheckoutScreen(props: CheckoutScreenProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(props.initialAddress ?? "");
  const [comment, setComment] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoQuote, setPromoQuote] = useState<PromoQuotePublic | null>(null);
  const [promoPending, setPromoPending] = useState(false);
  const [payMode, setPayMode] = useState<CheckoutPayMode>("money");
  const [pointsDraft, setPointsDraft] = useState("");
  const [formError, setFormError] = useState("");

  const itemCount = props.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  async function onApplyPromo() {
    Keyboard.dismiss();
    setFormError("");
    setPromoPending(true);
    try {
      const quote = await props.onPreviewPromo(promoCode);
      setPromoQuote(quote);
    } catch (caught) {
      setPromoQuote(null);
      setFormError(
        caught instanceof Error ? caught.message : "Не удалось применить промокод",
      );
    } finally {
      setPromoPending(false);
    }
  }

  const payableBeforePoints = promoQuote?.payableCents ?? props.cart.totalCents;
  const maxPoints = maxLoyaltyPointsForPayable(
    props.loyaltyPoints,
    payableBeforePoints,
  );
  const requestedPoints =
    payMode === "money"
      ? 0
      : payMode === "points_max"
        ? maxPoints
        : Number.parseInt(pointsDraft, 10) || 0;
  const pointsToSpend = clampLoyaltyPointsToSpend({
    requested: requestedPoints,
    balance: props.loyaltyPoints,
    payableCents: payableBeforePoints,
  });
  const payableCents = payableAfterLoyaltyCents(
    payableBeforePoints,
    pointsToSpend,
  );

  async function onSubmit() {
    Keyboard.dismiss();
    setFormError("");
    try {
      await props.onSubmit({ phone, address, comment, promoCode, pointsToSpend });
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
        {promoQuote?.giftProductName ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{promoQuote.giftProductName}</Text>
            <Text style={styles.muted}>Подарок по промокоду</Text>
          </View>
        ) : null}
        {promoQuote && promoQuote.discountCents > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Скидка</Text>
            <Text style={styles.muted}>
              −{formatPriceSomLabel(promoQuote.discountCents)}
            </Text>
          </View>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого ({itemCount} шт.)</Text>
          <Text style={styles.totalValue}>
            {formatPriceSomLabel(payableCents)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Промокод</Text>
        <Text style={styles.label}>Код</Text>
        <TextInput
          value={promoCode}
          onChangeText={(value) => {
            setPromoCode(value);
            setPromoQuote(null);
          }}
          placeholder="Необязательно"
          autoCapitalize="characters"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Pressable
          onPress={() => void onApplyPromo()}
          disabled={promoPending || props.pending}
          style={[
            styles.secondaryButton,
            promoPending ? styles.buttonDisabled : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            {promoPending ? "Проверяем…" : "Применить"}
          </Text>
        </Pressable>
        {promoQuote ? (
          <Text style={styles.promoOk}>{promoQuote.message}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>Оплата баллами</Text>
        <Text style={styles.muted}>
          На счёте {props.loyaltyPoints} б. · 1 балл = 1 сом · за 100 сом оплаты
          начислим 5 баллов
        </Text>
        {maxPoints > 0 ? (
          <>
            <View style={styles.chipRow}>
              {CHECKOUT_PAY_MODES.map((mode) => {
                const active = payMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setPayMode(mode)}
                    style={[styles.chip, active ? styles.chipActive : null]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active ? styles.chipTextActive : null,
                      ]}
                    >
                      {checkoutPayModeLabel(mode)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {payMode === "points_part" ? (
              <>
                <Text style={styles.label}>Сколько баллов списать</Text>
                <TextInput
                  value={pointsDraft}
                  onChangeText={setPointsDraft}
                  placeholder={`До ${maxPoints}`}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </>
            ) : null}
            {pointsToSpend > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Баллами</Text>
                <Text style={styles.muted}>−{pointsToSpend} б.</Text>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.muted}>Пока нечем списать — копите с заказов.</Text>
        )}

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
      ...CARD_SHADOW,
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
    secondaryButton: {
      marginTop: 8,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    secondaryButtonText: {
      color: colors.textPrimary,
      fontWeight: "600",
    },
    promoOk: {
      color: colors.accent,
      fontSize: 13,
      marginTop: 4,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    chipActive: {
      backgroundColor: colors.buttonBackground,
      borderColor: colors.buttonBackground,
    },
    chipText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    chipTextActive: {
      color: colors.buttonText,
    },
  });
}
