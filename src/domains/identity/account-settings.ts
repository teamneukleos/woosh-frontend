import { api } from "@/lib/api";

export async function updateNotificationPreferences(input: {
  userId: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
}) {
  return api("/auth/preferences", {
    method: "PATCH",
    body: {
      emailNotifications: input.emailNotifications,
      weeklyDigest: input.weeklyDigest,
    },
  });
}

export async function changePassword(
  _userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  return api("/auth/change-password", {
    method: "POST",
    body: input,
  });
}
