import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../lib/theme-context";

/** Временный знак бренда, пока нет названия и финального логотипа. */
export function BrandMark(props: { size?: number }) {
  const { colors } = useAppTheme();
  const size = props.size ?? 56;
  const fontSize = Math.round(size * 0.42);

  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.logoMarkBg,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize, color: colors.logoMark }]}>
        S
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
