import { Image, StyleSheet, View } from "react-native";
import { useAppTheme } from "../lib/theme-context";

const logoLightSource = require("../../assets/logo.png");
const logoDarkSource = require("../../assets/logo_dark.jpg");

/** Логотип ROLA: светлый PNG / тёмный logo_dark. */
export function BrandLogo(props: { height?: number }) {
  const { mode } = useAppTheme();
  const height = props.height ?? Math.round(36 * 1.9 * 1.6);
  const source = mode === "dark" ? logoDarkSource : logoLightSource;

  return (
    <View style={styles.wrap}>
      <Image
        source={source}
        style={{ height, width: height * 2.6 }}
        resizeMode="contain"
        fadeDuration={0}
        accessibilityLabel="ROLA"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
