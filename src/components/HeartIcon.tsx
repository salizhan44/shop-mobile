import { StyleSheet, Text } from "react-native";

export function HeartIcon(props: {
  filled: boolean;
  color: string;
  size?: number;
}) {
  const size = props.size ?? 20;
  return (
    <Text
      style={[
        styles.heart,
        {
          fontSize: size,
          lineHeight: size + 2,
          color: props.color,
        },
      ]}
    >
      {props.filled ? "♥" : "♡"}
    </Text>
  );
}

const styles = StyleSheet.create({
  heart: {
    fontWeight: "500",
    textAlign: "center",
  },
});
