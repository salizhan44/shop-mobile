export const UPDATES_POLL_INTERVAL_MS = 30_000;

export type UpdatesCheckPublic = {
  hasUpdates: boolean;
  latestAt: string | null;
};

export function isUpdatesCheckPublic(value: unknown): value is UpdatesCheckPublic {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const body = value as { hasUpdates?: unknown; latestAt?: unknown };
  return (
    typeof body.hasUpdates === "boolean" &&
    (body.latestAt === null || typeof body.latestAt === "string")
  );
}
