import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RefreshWithUpdates } from "../components/RefreshWithUpdates";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import {
  formatSupportTicketDate,
  supportTicketStatusLabel,
} from "../lib/support-format.shared";
import type { SupportScreenProps } from "./support-screen.shared";

export function SupportScreen(props: SupportScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");

  async function onSubmit() {
    setFormError("");
    try {
      await props.onCreate(subject, body);
      setSubject("");
      setBody("");
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Не удалось отправить",
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <RefreshWithUpdates
          hasUpdates={props.hasUpdates}
          onRefresh={props.onRefresh}
          pending={props.refreshPending}
        />
      </View>
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="never"
        keyboardDismissMode="on-drag"
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
    toolbar: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 4,
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
