import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
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
import { BOTTOM_TAB_BAR_CONTENT_INSET } from "../components/BottomTabBar";

/** Запас под строку подсказок над клавиатурой. */
const KEYBOARD_SUGGESTIONS_EXTRA = 52;

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

export function ProfileScreen(props: ProfileScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const nameWrapRef = useRef<View>(null);
  const addressWrapRef = useRef<View>(null);
  const [name, setName] = useState(props.customer.name);
  const [address, setAddress] = useState(props.customer.homeAddress);
  const [localError, setLocalError] = useState("");
  const [savedHint, setSavedHint] = useState(false);
  const [keyboardPad, setKeyboardPad] = useState(0);
  /** Сколько пикселей снизу окна закрыто клавиатурой (+ подсказки) — для расчёта скролла. */
  const keyboardCoverRef = useRef(0);

  useEffect(() => {
    setName(props.customer.name);
    setAddress(props.customer.homeAddress);
  }, [props.customer.name, props.customer.homeAddress]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates.height;
      if (Platform.OS === "ios") {
        // insets уже поднимают контент; в padding — только подсказки
        keyboardCoverRef.current =
          keyboardHeight + KEYBOARD_SUGGESTIONS_EXTRA;
        setKeyboardPad(KEYBOARD_SUGGESTIONS_EXTRA);
      } else {
        // window resize уже учёл клавиатуру — нужен запас под подсказки
        keyboardCoverRef.current = KEYBOARD_SUGGESTIONS_EXTRA;
        setKeyboardPad(KEYBOARD_SUGGESTIONS_EXTRA);
      }
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      keyboardCoverRef.current = 0;
      setKeyboardPad(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const isDirty =
    name.trim() !== props.customer.name.trim() ||
    address.trim() !== props.customer.homeAddress.trim();

  const saveLabel = props.pending
    ? "Сохраняем…"
    : savedHint && !isDirty
      ? "Сохранено"
      : "Сохранить";

  function onChangeName(next: string) {
    setName(next);
    setSavedHint(false);
  }

  function onChangeAddress(next: string) {
    setAddress(next);
    setSavedHint(false);
  }

  function keepFieldVisible(wrapRef: RefObject<View | null>) {
    const wrap = wrapRef.current;
    if (!wrap) {
      return;
    }
    wrap.measureInWindow((_x, y, _width, height) => {
      const windowHeight = Dimensions.get("window").height;
      const cover = Math.max(
        keyboardCoverRef.current,
        KEYBOARD_SUGGESTIONS_EXTRA,
      );
      const safeBottom = windowHeight - cover - 8;
      const fieldBottom = y + height;
      if (fieldBottom <= safeBottom) {
        return;
      }
      const delta = fieldBottom - safeBottom;
      scrollRef.current?.scrollTo({
        y: Math.max(0, scrollYRef.current + delta),
        animated: true,
      });
    });
  }

  function onFocusField(wrapRef: RefObject<View | null>) {
    // ждём появления клавиатуры / подсказок
    setTimeout(() => keepFieldVisible(wrapRef), 100);
    setTimeout(() => keepFieldVisible(wrapRef), 320);
  }

  async function onSave() {
    setLocalError("");
    try {
      await props.onSaveProfile({ name, homeAddress: address });
      setSavedHint(true);
    } catch (caught) {
      setSavedHint(false);
      setLocalError(friendlyError(caught, "Не удалось сохранить"));
    }
  }

  async function onChangeAvatar() {
    setLocalError("");
    setSavedHint(false);
    try {
      await props.onChangeAvatar();
      setSavedHint(true);
    } catch (caught) {
      setLocalError(friendlyError(caught, "Не удалось сменить аватар"));
    }
  }

  async function onRemoveAvatar() {
    setLocalError("");
    setSavedHint(false);
    try {
      await props.onRemoveAvatar();
      setSavedHint(true);
    } catch (caught) {
      setLocalError(friendlyError(caught, "Не удалось удалить аватар"));
    }
  }

  const hasAvatar = props.customer.avatarUrl.trim().length > 0;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: BOTTOM_TAB_BAR_CONTENT_INSET + keyboardPad },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      scrollEventThrottle={16}
      onScroll={(event) => {
        scrollYRef.current = event.nativeEvent.contentOffset.y;
      }}
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
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
              style={styles.removeAvatarButton}
              accessibilityLabel="Удалить фото"
              hitSlop={6}
            >
              <Text style={styles.removeAvatarIcon}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <View ref={nameWrapRef} collapsable={false} style={styles.fieldBlock}>
          <Text style={styles.label}>Имя</Text>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            onFocus={() => onFocusField(nameWrapRef)}
            placeholder="Как к вам обращаться"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
        <View ref={addressWrapRef} collapsable={false} style={styles.fieldBlock}>
          <Text style={styles.label}>Домашний адрес</Text>
          <Text style={styles.hint}>
            Подставится при оформлении заказа — там его можно изменить.
          </Text>
          <TextInput
            value={address}
            onChangeText={onChangeAddress}
            onFocus={() => onFocusField(addressWrapRef)}
            placeholder="Город, улица, дом, квартира"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.input, styles.textarea]}
          />
        </View>
        <Pressable
          onPress={onSave}
          disabled={props.pending || (savedHint && !isDirty)}
          style={[
            styles.primaryButton,
            props.pending || (savedHint && !isDirty) ? styles.disabled : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>{saveLabel}</Text>
        </Pressable>
      </View>

      {localError || props.error ? (
        <Text style={styles.error} numberOfLines={4}>
          {localError || props.error}
        </Text>
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
    fieldBlock: {
      gap: 8,
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
    removeAvatarButton: {
      minWidth: 36,
      height: 36,
      paddingHorizontal: 10,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    removeAvatarIcon: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.error,
      marginTop: -1,
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
    error: {
      color: colors.error,
      fontSize: 14,
    },
    disabled: {
      opacity: 0.6,
    },
  });
}
