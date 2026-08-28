import type { SupportTicketPublic } from "../lib/api";

export type SupportScreenProps = {
  tickets: SupportTicketPublic[];
  error: string;
  submitPending: boolean;
  onBack: () => void;
  onCreate: (subject: string, body: string) => Promise<void>;
};
