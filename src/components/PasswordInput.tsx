import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";

export function PasswordInput(props: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.row}>
      <TextInput
        placeholder={props.placeholder ?? "Пароль"}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={!visible}
        value={props.value}
        onChangeText={props.onChangeText}
        style={styles.input}
      />
      <Pressable
        onPress={() => setVisible((current) => !current)}
        style={styles.toggle}
      >
        <Text style={styles.toggleText}>{visible ? "Скрыть" : "Показать"}</Text>
      </Pressable>
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
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    toggle: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      backgroundColor: colors.cardBackground,
    },
    toggleText: {
      color: colors.textPrimary,
      fontSize: 13,
    },
  });
}
