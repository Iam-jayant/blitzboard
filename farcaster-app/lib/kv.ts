import { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";

// In-memory store for notification details
// For production, replace with a persistent store (e.g. Supabase table)
const notificationStore = new Map<string, MiniAppNotificationDetails>();

function getUserNotificationDetailsKey(fid: number): string {
  return `${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<MiniAppNotificationDetails | null> {
  return notificationStore.get(getUserNotificationDetailsKey(fid)) ?? null;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  notificationStore.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  notificationStore.delete(getUserNotificationDetailsKey(fid));
}
