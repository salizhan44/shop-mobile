import { AppState, type AppStateStatus } from "react-native";
import { pingAppSession, SESSION_EXPIRED_MESSAGE } from "./api";
import {
  SESSION_PING_SECONDS_MAX,
} from "./session-time.shared";

export function startAppSessionPing(enabled: boolean): () => void {
  if (!enabled) {
    return () => undefined;
  }

  let lastStamp = Date.now();
  let pendingMs = 0;

  async function flush(): Promise<void> {
    const seconds = Math.floor(pendingMs / 1000);
    if (seconds < 1) {
      return;
    }
    pendingMs -= seconds * 1000;
    const chunk = Math.min(SESSION_PING_SECONDS_MAX, seconds);
    try {
      await pingAppSession(chunk);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message === SESSION_EXPIRED_MESSAGE ||
        message === "Нужно войти"
      ) {
        pendingMs = 0;
        return;
      }
      pendingMs += chunk * 1000;
    }
  }

  const timer = setInterval(() => {
    const now = Date.now();
    pendingMs += now - lastStamp;
    lastStamp = now;
    if (pendingMs >= 30_000) {
      void flush();
    }
  }, 5000);

  const subscription = AppState.addEventListener(
    "change",
    (next: AppStateStatus) => {
      const now = Date.now();
      if (next !== "active") {
        pendingMs += now - lastStamp;
        lastStamp = now;
        void flush();
        return;
      }
      lastStamp = now;
    },
  );

  return () => {
    clearInterval(timer);
    subscription.remove();
    const now = Date.now();
    pendingMs += now - lastStamp;
    void flush();
  };
}
