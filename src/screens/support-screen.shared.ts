import type { SupportTicketPublic } from "../lib/api";

export type SupportScreenProps = {
  tickets: SupportTicketPublic[];
  error: string;
  submitPending: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onCreate: (
    subject: string,
    body: string,
    imageUrls: string[],
  ) => Promise<void>;
};
