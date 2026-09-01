import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { APP_THEME } from "../lib/app-theme.shared";

export function PasswordInput(props: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.row}>
      <TextInput
        placeholder={props.placeholder ?? "Пароль"}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: APP_THEME.cardBackground,
    color: APP_THEME.textPrimary,
  },
  toggle: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: APP_THEME.cardBackground,
  },
  toggleText: {
    color: APP_THEME.textPrimary,
    fontSize: 13,
  },
});
