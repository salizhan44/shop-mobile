import { StyleSheet, View } from "react-native";

/** Простая иконка тележки корзины, без эмодзи. */
export function CartIcon(props: { color: string; size?: number }) {
  const size = props.size ?? 22;
  const basketW = Math.round(size * 0.72);
  const basketH = Math.round(size * 0.42);
  const handleW = Math.round(size * 0.38);
  const handleH = Math.round(size * 0.28);
  const wheel = Math.max(3, Math.round(size * 0.16));
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={{
          width: handleW,
          height: handleH,
          borderTopWidth: stroke,
          borderLeftWidth: stroke,
          borderRightWidth: stroke,
          borderBottomWidth: 0,
          borderColor: props.color,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          marginBottom: -1,
          marginLeft: Math.round(size * 0.08),
          alignSelf: "flex-start",
        }}
      />
      <View
        style={{
          width: basketW,
          height: basketH,
          borderWidth: stroke,
          borderColor: props.color,
          borderRadius: 3,
        }}
      />
      <View style={[styles.wheels, { width: basketW, gap: basketW * 0.28 }]}>
        <View
          style={{
            width: wheel,
            height: wheel,
            borderRadius: wheel / 2,
            backgroundColor: props.color,
          }}
        />
        <View
          style={{
            width: wheel,
            height: wheel,
            borderRadius: wheel / 2,
            backgroundColor: props.color,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  wheels: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 2,
  },
});
