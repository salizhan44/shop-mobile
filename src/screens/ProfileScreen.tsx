import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { customerInitials } from "../lib/catalog-search.shared";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import type { ProfileScreenProps } from "./profile-screen.shared";

export function ProfileScreen(props: ProfileScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState(props.customer.name);
  const [address, setAddress] = useState(props.customer.homeAddress);
  const [localError, setLocalError] = useState("");
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    setName(props.customer.name);
    setAddress(props.customer.homeAddress);
  }, [props.customer.name, props.customer.homeAddress]);

  async function onSave() {
    setLocalError("");
    setSavedHint(false);
    try {
      await props.onSaveProfile({ name, homeAddress: address });
      setSavedHint(true);
    } catch (caught) {
      setLocalError(
        caught instanceof Error ? caught.message : "Не удалось сохранить",
      );
    }
  }

  async function onChangeAvatar() {
    setLocalError("");
    setSavedHint(false);
    try {
      await props.onChangeAvatar();
      setSavedHint(true);
    } catch (caught) {
      setLocalError(
        caught instanceof Error ? caught.message : "Не удалось сменить аватар",
      );
    }
  }

  async function onRemoveAvatar() {
    setLocalError("");
    setSavedHint(false);
    try {
      await props.onRemoveAvatar();
      setSavedHint(true);
    } catch (caught) {
      setLocalError(
        caught instanceof Error ? caught.message : "Не удалось удалить аватар",
      );
    }
  }

  const hasAvatar = props.customer.avatarUrl.trim().length > 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={styles.hero}>
        <View style={styles.avatarWrap}>
          {hasAvatar ? (
            <Image
              source={{ uri: props.customer.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {customerInitials(props.customer.name)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.email}>{props.customer.email}</Text>
        <View style={styles.avatarActions}>
          <Pressable
            onPress={onChangeAvatar}
            disabled={props.pending}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {hasAvatar ? "Сменить фото" : "Загрузить фото"}
            </Text>
          </Pressable>
          {hasAvatar ? (
            <Pressable
              onPress={onRemoveAvatar}
              disabled={props.pending}
              style={styles.secondaryButton}
            >
              <Text style={[styles.secondaryButtonText, styles.dangerText]}>
                Удалить
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Имя</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Как к вам обращаться"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Домашний адрес</Text>
        <Text style={styles.hint}>
          Подставится при оформлении заказа — там его можно изменить.
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Город, улица, дом, квартира"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.textarea]}
        />
        <Pressable
          onPress={onSave}
          disabled={props.pending}
          style={[styles.primaryButton, props.pending ? styles.disabled : null]}
        >
          <Text style={styles.primaryButtonText}>
            {props.pending ? "Сохраняем…" : "Сохранить"}
          </Text>
        </Pressable>
        {savedHint && !localError && !props.error ? (
          <Text style={styles.saved}>Сохранено</Text>
        ) : null}
      </View>

      {localError || props.error ? (
        <Text style={styles.error}>{localError || props.error}</Text>
      ) : null}

      <Pressable onPress={props.onLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Выйти</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      gap: 14,
    },
    hero: {
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
    },
    avatarWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.logoMarkBg,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarFallbackText: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.accent,
    },
    email: {
      fontSize: 14,
      color: colors.textMuted,
    },
    avatarActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
      marginTop: 4,
    },
    card: {
      borderRadius: 14,
      padding: 14,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 10,
    },
    label: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    hint: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    textarea: {
      minHeight: 88,
      textAlignVertical: "top",
    },
    primaryButton: {
      backgroundColor: colors.buttonBackground,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    primaryButtonText: {
      color: colors.buttonText,
      fontWeight: "700",
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.cardBackground,
    },
    secondaryButtonText: {
      color: colors.textPrimary,
      fontWeight: "600",
      fontSize: 13,
    },
    logoutButton: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.error,
    },
    dangerText: {
      color: colors.error,
    },
    error: {
      color: colors.error,
      fontSize: 14,
    },
    saved: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    disabled: {
      opacity: 0.6,
    },
  });
}
