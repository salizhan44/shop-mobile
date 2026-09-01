import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { RefreshWithUpdates } from "../components/RefreshWithUpdates";
import { APP_THEME } from "../lib/app-theme.shared";
import {
  formatSupportTicketDate,
  supportTicketStatusLabel,
} from "../lib/support-format.shared";
import type { SupportScreenProps } from "./support-screen.shared";

export function SupportScreen(props: SupportScreenProps) {
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
      <StatusBar style="dark" />
      <Pressable onPress={props.onBack}>
        <Text style={styles.link}>К каталогу</Text>
      </Pressable>
      <Text style={styles.title}>Поддержка</Text>
      <RefreshWithUpdates
        hasUpdates={props.hasUpdates}
        onRefresh={props.onRefresh}
        pending={props.refreshPending}
      />
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      <View style={styles.form}>
        <TextInput
          placeholder="Тема"
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
        />
        <TextInput
          placeholder="Опишите проблему или вопрос"
          value={body}
          onChangeText={setBody}
          multiline
          style={[styles.input, styles.textarea]}
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
      <ScrollView style={styles.list}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
    gap: 12,
    backgroundColor: APP_THEME.screenBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: APP_THEME.textPrimary,
  },
  muted: { color: APP_THEME.textMuted },
  link: { color: APP_THEME.link },
  error: { color: APP_THEME.error },
  form: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: APP_THEME.cardBackground,
    color: APP_THEME.textPrimary,
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  button: {
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: APP_THEME.buttonText },
  list: { marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: APP_THEME.cardBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: APP_THEME.cardBackground,
    gap: 4,
  },
  cardTitle: { fontWeight: "600", color: APP_THEME.textPrimary },
  body: { color: APP_THEME.textPrimary },
  reply: { color: APP_THEME.textMuted },
});
