import { Image, StyleSheet, View } from "react-native";

const logoSource = require("../../assets/logo.png");

/** Логотип ROLA в шапке / на экране входа (PNG с прозрачным фоном). */
export function BrandLogo(props: { height?: number }) {
  const height = props.height ?? Math.round(36 * 1.9 * 1.6);
  return (
    <View style={styles.wrap}>
      <Image
        source={logoSource}
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
