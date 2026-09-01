import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { APP_THEME } from "../lib/app-theme.shared";
import { formatPriceSomLabel } from "../lib/orders-format.shared";
import type { ProductDetailModalProps } from "./product-detail-modal.shared";

export function ProductDetailModal(props: ProductDetailModalProps) {
  const product = props.product;
  if (!product) {
    return null;
  }

  return (
    <Modal
      visible={product !== null}
      transparent
      animationType="fade"
      onRequestClose={props.onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={props.onClose} />
        <View style={styles.dialogWrap}>
          <View style={styles.dialog}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>▦</Text>
              </View>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.price}>
                {formatPriceSomLabel(product.priceCents)}
              </Text>
              <Text style={styles.sectionLabel}>Описание</Text>
              <Text style={styles.description}>
                {product.description.trim().length > 0
                  ? product.description
                  : "Описание пока не добавлено."}
              </Text>
            </ScrollView>
            <View style={styles.actions}>
              <Pressable
                onPress={() => props.onAdd(product.id)}
                disabled={props.adding}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {props.adding ? "Добавляем…" : "В корзину"}
                </Text>
              </Pressable>
              <Pressable onPress={props.onClose} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Назад</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: APP_THEME.overlay,
  },
  dialogWrap: {
    width: "88%",
    maxWidth: 360,
    maxHeight: "78%",
  },
  dialog: {
    borderRadius: 16,
    backgroundColor: APP_THEME.cardBackground,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: APP_THEME.border,
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: APP_THEME.screenBackground,
    borderWidth: 1,
    borderColor: APP_THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 48,
    color: APP_THEME.textMuted,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: APP_THEME.textPrimary,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: APP_THEME.accent,
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: APP_THEME.textMuted,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: APP_THEME.textPrimary,
  },
  actions: {
    padding: 16,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: APP_THEME.border,
  },
  primaryButton: {
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: APP_THEME.buttonText,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: APP_THEME.screenBackground,
  },
  secondaryButtonText: {
    color: APP_THEME.textPrimary,
    fontWeight: "600",
  },
});
