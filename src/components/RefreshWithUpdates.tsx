import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";

export function RefreshWithUpdates(props: {
  hasUpdates: boolean;
  onRefresh: () => void;
  pending?: boolean;
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    button: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.cardBackground,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.textPrimary,
      fontSize: 14,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.updateIndicator,
    },
  });
}
