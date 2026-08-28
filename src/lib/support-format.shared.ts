import type { SupportTicketPublic } from "../lib/api";

export function supportTicketStatusLabel(
  status: SupportTicketPublic["status"],
): string {
  switch (status) {
    case "OPEN":
      return "Открыто";
    case "CLOSED":
      return "Закрыто";
  }
}

export function formatSupportTicketDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU");
}
