import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import type { CatalogSearchBarProps } from "./catalog-search-bar.shared";

const SEARCH_ICON_SIZE = 18 * 1.4;

export function CatalogSearchBar(props: CatalogSearchBarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Поиск"
        placeholderTextColor={colors.textMuted}
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
      <Pressable onPress={onSubmit} hitSlop={6} accessibilityLabel="Найти">
        <Text style={styles.icon}>⌕</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    wrap: {
      alignSelf: "stretch",
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      minHeight: 42,
      borderRadius: 999,
      paddingHorizontal: 14,
      backgroundColor: colors.searchBackground,
      gap: 8,
    },
    icon: {
      fontSize: SEARCH_ICON_SIZE,
      color: colors.textMuted,
      lineHeight: SEARCH_ICON_SIZE + 2,
    },
    input: {
      flex: 1,
      paddingVertical: 8,
      fontSize: 15,
      color: colors.textPrimary,
    },
    clearButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.border,
    },
    clearText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "700",
    },
  });
}
