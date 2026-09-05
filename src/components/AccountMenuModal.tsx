import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";

export function AccountMenuModal(props: {
  visible: boolean;
  onClose: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors, mode, toggleMode } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={props.onClose} />
        <View style={[styles.menuWrap, { top: insets.top + 110 }]}>
          <View style={styles.menu}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                toggleMode();
              }}
            >
              <Text style={styles.menuItemText}>
                {mode === "light" ? "Тёмная тема" : "Светлая тема"}
              </Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                props.onClose();
                props.onOpenSupport();
              }}
            >
              <Text style={styles.menuItemText}>Поддержка</Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                props.onClose();
                props.onLogout();
              }}
            >
              <Text style={[styles.menuItemText, styles.danger]}>Выйти</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    menuWrap: {
      position: "absolute",
      left: 16,
    },
    menu: {
      width: 200,
      borderRadius: 14,
      backgroundColor: colors.cardBackground,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuItem: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: "500",
    },
    danger: {
      color: colors.error,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
  });
}
