import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { customerInitials } from "../lib/catalog-search.shared";
import { APP_THEME } from "../lib/app-theme.shared";
import type { AccountMenuModalProps } from "../lib/app-shell.shared";

export function AccountMenuModal(props: AccountMenuModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={props.onClose} />
        <View style={[styles.menuWrap, { top: insets.top + 52 }]}>
          <View style={styles.menu}>
            <View style={styles.profile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {customerInitials(props.customerName)}
                </Text>
              </View>
              <Text style={styles.profileName} numberOfLines={1}>
                {props.customerName}
              </Text>
            </View>
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
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                Выйти
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: APP_THEME.overlay,
  },
  menuWrap: {
    position: "absolute",
    right: 16,
  },
  menu: {
    width: 220,
    borderRadius: 12,
    backgroundColor: APP_THEME.cardBackground,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: APP_THEME.border,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  profile: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APP_THEME.screenBackground,
    borderWidth: 1,
    borderColor: APP_THEME.border,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: APP_THEME.accent,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: APP_THEME.textPrimary,
    textAlign: "center",
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: APP_THEME.textPrimary,
    fontWeight: "500",
  },
  menuItemDanger: {
    color: APP_THEME.error,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: APP_THEME.border,
  },
});
