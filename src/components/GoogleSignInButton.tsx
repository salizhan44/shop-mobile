import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";

WebBrowser.maybeCompleteAuthSession();

function envClientId(name: string): string {
  return (process.env[name] ?? "").trim();
}

function googleClientIds() {
  const webClientId = envClientId("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
  const iosClientId = envClientId("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID");
  const androidClientId = envClientId("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID");
  return { webClientId, iosClientId, androidClientId };
}

function platformGoogleClientId(ids: {
  webClientId: string;
  iosClientId: string;
  androidClientId: string;
}): string {
  if (Platform.OS === "ios") {
    return ids.iosClientId || ids.webClientId;
  }
  if (Platform.OS === "android") {
    return ids.androidClientId || ids.webClientId;
  }
  return ids.webClientId;
}

export function GoogleSignInButton(props: {
  disabled?: boolean;
  onIdToken: (idToken: string) => Promise<void>;
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const ids = googleClientIds();
  const platformClientId = platformGoogleClientId(ids);
  const [configError, setConfigError] = useState("");

  if (!platformClientId) {
    return (
      <View style={styles.wrap}>
        <Pressable
          disabled={props.disabled}
          onPress={() =>
            setConfigError("Вход через Google сейчас недоступен");
          }
          style={[styles.button, props.disabled ? styles.buttonDisabled : null]}
        >
          <Text style={styles.buttonText}>Войти через Google</Text>
        </Pressable>
        {configError ? <Text style={styles.error}>{configError}</Text> : null}
      </View>
    );
  }

  return (
    <GoogleSignInButtonReady
      disabled={props.disabled}
      onIdToken={props.onIdToken}
      webClientId={ids.webClientId || platformClientId}
      iosClientId={ids.iosClientId || ids.webClientId || platformClientId}
      androidClientId={
        ids.androidClientId || ids.webClientId || platformClientId
      }
    />
  );
}

function GoogleSignInButtonReady(props: {
  disabled?: boolean;
  onIdToken: (idToken: string) => Promise<void>;
  webClientId: string;
  iosClientId: string;
  androidClientId: string;
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [localError, setLocalError] = useState("");
  const [pending, setPending] = useState(false);
  const handledRef = useRef<string | null>(null);
  const onIdTokenRef = useRef(props.onIdToken);
  onIdTokenRef.current = props.onIdToken;

  // clientId — запасной для любой платформы; без ios/android ID хук падает при рендере.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: props.webClientId,
    webClientId: props.webClientId,
    iosClientId: props.iosClientId,
    androidClientId: props.androidClientId,
  });

  useEffect(() => {
    if (!response) {
      return;
    }
    if (response.type !== "success" && response.type !== "error") {
      return;
    }
    const responseKey =
      response.type === "success"
        ? `success:${response.params.id_token ?? response.authentication?.idToken ?? ""}`
        : `error:${response.error?.code ?? "unknown"}`;
    if (handledRef.current === responseKey) {
      return;
    }
    handledRef.current = responseKey;

    if (response.type === "success") {
      const idToken =
        response.params.id_token ??
        (typeof response.authentication?.idToken === "string"
          ? response.authentication.idToken
          : "");
      if (!idToken) {
        setLocalError("Google не вернул токен");
        return;
      }
      setPending(true);
      setLocalError("");
      void onIdTokenRef
        .current(idToken)
        .catch((caught: unknown) => {
          setLocalError(
            caught instanceof Error
              ? caught.message
              : "Не удалось войти через Google",
          );
        })
        .finally(() => {
          setPending(false);
        });
      return;
    }
    setLocalError("Вход через Google не удался");
  }, [response]);

  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={props.disabled || pending || !request}
        onPress={() => {
          setLocalError("");
          handledRef.current = null;
          void promptAsync();
        }}
        style={[
          styles.button,
          props.disabled || pending || !request
            ? styles.buttonDisabled
            : null,
        ]}
      >
        {pending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Войти через Google</Text>
        )}
      </Pressable>
      {localError ? <Text style={styles.error}>{localError}</Text> : null}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: 8,
      marginTop: 4,
    },
    button: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.textPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    error: {
      color: colors.error,
      fontSize: 13,
      textAlign: "center",
    },
  });
}
