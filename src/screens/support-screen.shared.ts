import type { SupportTicketPublic } from "../lib/api";

export type SupportScreenProps = {
  tickets: SupportTicketPublic[];
  error: string;
  submitPending: boolean;
  hasUpdates: boolean;
  refreshPending: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onCreate: (subject: string, body: string) => Promise<void>;
};
