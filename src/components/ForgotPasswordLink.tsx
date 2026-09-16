import { Pressable, StyleSheet, Text } from "react-native";
import * as Linking from "expo-linking";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import {
  forgotPasswordMessage,
  shopWhatsAppPhoneFromEnv,
  shopWhatsAppUrl,
} from "../lib/forgot-password.shared";

export function ForgotPasswordLink(props: { email: string; disabled?: boolean }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  async function onPress() {
    const url = shopWhatsAppUrl(
      shopWhatsAppPhoneFromEnv(),
      forgotPasswordMessage(props.email),
    );
    await Linking.openURL(url);
  }

  return (
    <Pressable disabled={props.disabled} onPress={() => void onPress()}>
      <Text style={styles.link}>Забыли пароль?</Text>
    </Pressable>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    link: {
      color: colors.link,
      fontSize: 14,
    },
  });
}
