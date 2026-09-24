import { prisma } from "./prisma";

/** Fire-and-forget activity log for the dashboard feed. Never throws. */
export function logActivity(action: string, message: string): void {
  prisma.activity
    .create({ data: { action, message } })
    .catch(() => {});
}
