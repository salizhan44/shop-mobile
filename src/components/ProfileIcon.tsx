import { StyleSheet, View } from "react-native";

/** Простая иконка профиля (голова + плечи), без эмодзи. */
export function ProfileIcon(props: { color: string; size?: number }) {
  const size = props.size ?? 22;
  const head = Math.round(size * 0.38);
  const bodyW = Math.round(size * 0.72);
  const bodyH = Math.round(size * 0.36);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={{
          width: head,
          height: head,
          borderRadius: head / 2,
          borderWidth: 1.6,
          borderColor: props.color,
        }}
      />
      <View
        style={{
          marginTop: 2,
          width: bodyW,
          height: bodyH,
          borderTopLeftRadius: bodyW / 2,
          borderTopRightRadius: bodyW / 2,
          borderWidth: 1.6,
          borderBottomWidth: 0,
          borderColor: props.color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
