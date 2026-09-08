import { useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import {
  formatSupportTicketDate,
  supportTicketStatusLabel,
} from "../lib/support-format.shared";
import type { SupportScreenProps } from "./support-screen.shared";
import { CARD_SHADOW } from "../lib/card-shadow.shared";

const MAX_SUPPORT_PHOTOS = 5;
const MAX_SUPPORT_PHOTO_DATA_URL = 2_000_000;
const SUPPORT_PHOTO_MAX_WIDTH = 1280;

async function compressSupportPhoto(
  uri: string,
  width?: number,
  height?: number,
): Promise<string | null> {
  const longest = Math.max(width ?? 0, height ?? 0);
  const target = Math.min(
    longest > 0 ? longest : SUPPORT_PHOTO_MAX_WIDTH,
    SUPPORT_PHOTO_MAX_WIDTH,
  );

  async function encode(
    compress: number,
    size: number,
  ): Promise<string | null> {
    const sizeResize =
      (width ?? 0) >= (height ?? 0)
        ? { width: size }
        : { height: size };
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: sizeResize }],
      {
        compress,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      },
    );
    if (!manipulated.base64) {
      return null;
    }
    const dataUrl = `data:image/jpeg;base64,${manipulated.base64}`;
    if (dataUrl.length > MAX_SUPPORT_PHOTO_DATA_URL) {
      return null;
    }
    return dataUrl;
  }

  return (
    (await encode(0.55, target)) ??
    (await encode(0.35, Math.min(target, 960))) ??
    (await encode(0.25, Math.min(target, 720)))
  );
}

export function SupportScreen(props: SupportScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  async function onAddPhotos() {
    setFormError("");
    try {
      const remaining = MAX_SUPPORT_PHOTOS - imageUrls.length;
      if (remaining <= 0) {
        setFormError(`Можно прикрепить не больше ${MAX_SUPPORT_PHOTOS} фото`);
        return;
      }
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setFormError("Нужен доступ к фото");
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 1,
      });
      if (picked.canceled || picked.assets.length === 0) {
        return;
      }
      const next: string[] = [];
      let skipped = 0;
      for (const asset of picked.assets) {
        const dataUrl = await compressSupportPhoto(
          asset.uri,
          asset.width,
          asset.height,
        );
        if (!dataUrl) {
          skipped += 1;
          continue;
        }
        next.push(dataUrl);
      }
      if (next.length === 0) {
        setFormError(
          skipped > 0
            ? "Фото слишком большие — попробуйте другие или сделайте снимок заново"
            : "Не удалось прочитать фото",
        );
        return;
      }
      setImageUrls((current) =>
        [...current, ...next].slice(0, MAX_SUPPORT_PHOTOS),
      );
      if (skipped > 0) {
        setFormError(
          `Добавлено ${next.length}, пропущено ${skipped} (слишком большие)`,
        );
      }
    } catch {
      setFormError("Не удалось выбрать фото");
    }
  }

  async function onSubmit() {
    setFormError("");
    try {
      await props.onCreate(subject, body, imageUrls);
      setSubject("");
      setBody("");
      setImageUrls([]);
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Не удалось отправить",
      );
    }
  }

  return (
    <View style={styles.container}>
      {props.error ? <Text style={styles.errorBanner}>{props.error}</Text> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="never"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={props.refreshing}
            onRefresh={props.onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Новое обращение</Text>
          <TextInput
            placeholder="Тема"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            placeholder="Опишите проблему или вопрос"
            value={body}
            onChangeText={setBody}
            multiline
            style={[styles.input, styles.textarea]}
            placeholderTextColor={colors.textMuted}
          />
          {imageUrls.length > 0 ? (
            <View style={styles.photoRow}>
              {imageUrls.map((url, index) => (
                <View key={`${index}-${url.slice(0, 32)}`} style={styles.photoWrap}>
                  <View style={styles.photoFrame}>
                    <Image
                      source={{ uri: url }}
                      style={styles.photo}
                      resizeMode="contain"
                    />
                  </View>
                  <Pressable
                    onPress={() =>
                      setImageUrls((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    style={styles.photoRemove}
                    hitSlop={6}
                  >
                    <Text style={styles.photoRemoveText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
          <Pressable
            onPress={() => {
              void onAddPhotos();
            }}
            disabled={props.submitPending}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {imageUrls.length > 0
                ? `Добавить фото (${imageUrls.length}/${MAX_SUPPORT_PHOTOS})`
                : "Прикрепить фото"}
            </Text>
          </Pressable>
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <Pressable
            onPress={onSubmit}
            disabled={props.submitPending}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {props.submitPending ? "Отправляем…" : "Отправить"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>История</Text>
        {props.tickets.length === 0 && !props.error ? (
          <Text style={styles.muted}>Обращений пока нет.</Text>
        ) : (
          props.tickets.map((ticket) => (
            <View key={ticket.id} style={styles.card}>
              <Text style={styles.cardTitle}>{ticket.subject}</Text>
              <Text style={styles.muted}>
                {formatSupportTicketDate(ticket.createdAt)} ·{" "}
                {supportTicketStatusLabel(ticket.status)}
              </Text>
              <Text style={styles.body}>{ticket.body}</Text>
              {ticket.imageUrls.length > 0 ? (
                <View style={styles.photoRow}>
                  {ticket.imageUrls.map((url) => (
                    <View key={url} style={styles.historyPhotoFrame}>
                      <Image
                        source={{ uri: url }}
                        style={styles.historyPhoto}
                        resizeMode="contain"
                      />
                    </View>
                  ))}
                </View>
              ) : null}
              {ticket.staffReply ? (
                <Text style={styles.reply}>Ответ: {ticket.staffReply}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    errorBanner: {
      color: colors.error,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 12,
      paddingBottom: 24,
      gap: 10,
    },
    formCard: {
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 8,
    },
    formTitle: {
      fontWeight: "700",
      color: colors.textPrimary,
    },
    sectionTitle: {
      marginTop: 4,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    muted: {
      color: colors.textMuted,
    },
    error: {
      color: colors.error,
      paddingHorizontal: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.screenBackground,
      color: colors.textPrimary,
    },
    textarea: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    photoRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    photoWrap: {
      position: "relative",
      width: 72,
      height: 72,
    },
    photoFrame: {
      width: 72,
      height: 72,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.screenBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    photo: {
      width: "100%",
      height: "100%",
    },
    photoRemove: {
      position: "absolute",
      top: -6,
      right: -6,
      zIndex: 1,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.buttonBackground,
    },
    photoRemoveText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 18,
    },
    historyPhotoFrame: {
      width: 72,
      height: 72,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.screenBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    historyPhoto: {
      width: "100%",
      height: "100%",
    },
    secondaryButton: {
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.screenBackground,
    },
    secondaryButtonText: {
      color: colors.textPrimary,
      fontWeight: "600",
    },
    button: {
      backgroundColor: colors.buttonBackground,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: "600",
    },
    card: {
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 4,
      ...CARD_SHADOW,
    },
    cardTitle: {
      fontWeight: "700",
      color: colors.textPrimary,
    },
    body: {
      color: colors.textPrimary,
    },
    reply: {
      color: colors.textMuted,
    },
  });
}
