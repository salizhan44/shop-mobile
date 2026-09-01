import { Pressable, StyleSheet, Text, View } from "react-native";
import { APP_THEME } from "../lib/app-theme.shared";

export function RefreshWithUpdates(props: {
  hasUpdates: boolean;
  onRefresh: () => void;
  pending?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={props.onRefresh}
        disabled={props.pending}
        style={[styles.button, props.pending ? styles.buttonDisabled : null]}
      >
        <Text style={styles.buttonText}>
          {props.pending ? "Обновляем…" : "Обновить"}
        </Text>
      </Pressable>
      {props.hasUpdates ? <View style={styles.dot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: APP_THEME.cardBackground,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: APP_THEME.textPrimary,
    fontSize: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: APP_THEME.updateIndicator,
  },
});
