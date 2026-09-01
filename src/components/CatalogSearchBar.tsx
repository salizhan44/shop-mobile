import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { APP_THEME } from "../lib/app-theme.shared";
import type { CatalogSearchBarProps } from "./catalog-search-bar.shared";

const SEARCH_ICON_SIZE = 18 * 1.4;

export function CatalogSearchBar(props: CatalogSearchBarProps) {
  function onSubmit() {
    Keyboard.dismiss();
    props.onSubmit();
  }

  function onClear() {
    Keyboard.dismiss();
    props.onClear();
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Поиск"
        placeholderTextColor={APP_THEME.textMuted}
        returnKeyType="search"
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {props.showClear ? (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: APP_THEME.searchBackground,
    gap: 6,
  },
  icon: {
    fontSize: SEARCH_ICON_SIZE,
    color: APP_THEME.textMuted,
    lineHeight: SEARCH_ICON_SIZE + 2,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 15,
    color: APP_THEME.textPrimary,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APP_THEME.border,
  },
  clearText: {
    fontSize: 12,
    color: APP_THEME.textMuted,
    fontWeight: "700",
  },
});
