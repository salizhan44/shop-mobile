import { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppHeader } from "../components/AppHeader";
import { PasswordInput } from "../components/PasswordInput";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import type { ChangePasswordScreenProps } from "./change-password-screen.shared";

function friendlyError(caught: unknown, fallback: string): string {
  const raw = caught instanceof Error ? caught.message.trim() : fallback;
  if (
    !raw ||
    raw.length > 180 ||
    raw.includes("Prisma") ||
    raw.includes("\n") ||
    raw.includes("at ")
  ) {
    return fallback;
  }
  return raw;
}

export function ChangePasswordScreen(props: ChangePasswordScreenProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const [step, setStep] = useState<"current" | "next">("current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function onBack() {
    Keyboard.dismiss();
    if (step === "next") {
      setError("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("current");
      return;
    }
    props.onBack();
  }

  async function onContinue() {
    Keyboard.dismiss();
    setError("");
    try {
      await props.onVerifyCurrent(currentPassword);
      setError("");
      setStep("next");
    } catch (caught) {
      setError(friendlyError(caught, "Неверный текущий пароль"));
    }
  }

  async function onSave() {
    Keyboard.dismiss();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Новые пароли не совпадают");
      return;
    }
    try {
      await props.onSubmitNew({ currentPassword, newPassword });
      props.onBack();
    } catch (caught) {
      setError(friendlyError(caught, "Не удалось сменить пароль"));
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <AppHeader
        title={step === "current" ? "Сменить пароль" : "Новый пароль"}
        onBack={onBack}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {step === "current" ? (
          props.hasPassword ? (
            <>
              <Text style={styles.hint}>Введите текущий пароль</Text>
              <PasswordInput
                value={currentPassword}
                onChangeText={(value) => {
                  setCurrentPassword(value);
                  setError("");
                }}
                placeholder="Текущий пароль"
                autoComplete="current-password"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                onPress={() => {
                  void onContinue();
                }}
                disabled={props.pending || currentPassword.length === 0}
                style={[
                  styles.button,
                  props.pending || currentPassword.length === 0
                    ? styles.buttonDisabled
                    : null,
                ]}
              >
                <Text style={styles.buttonText}>
                  {props.pending ? "Проверяем…" : "Далее"}
                </Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.hint}>
              Этот аккаунт входит через Google, пароля нет.
            </Text>
          )
        ) : (
          <>
            <Text style={styles.hint}>Не короче 8 символов</Text>
            <PasswordInput
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setError("");
              }}
              placeholder="Новый пароль"
              autoComplete="new-password"
            />
            <PasswordInput
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setError("");
              }}
              placeholder="Повторите новый пароль"
              autoComplete="new-password"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              onPress={() => {
                void onSave();
              }}
              disabled={
                props.pending ||
                newPassword.length === 0 ||
                confirmPassword.length === 0
              }
              style={[
                styles.button,
                props.pending ||
                newPassword.length === 0 ||
                confirmPassword.length === 0
                  ? styles.buttonDisabled
                  : null,
              ]}
            >
              <Text style={styles.buttonText}>
                {props.pending ? "Сохраняем…" : "Сохранить"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 16,
      gap: 12,
    },
    hint: {
      fontSize: 15,
      color: colors.textMuted,
    },
    error: {
      color: colors.error,
      fontSize: 14,
    },
    button: {
      backgroundColor: colors.buttonBackground,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 4,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: "700",
      fontSize: 16,
    },
  });
}
