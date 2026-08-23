import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

export async function updateNotificationPreferences(input: {
  userId: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
}) {
  const updated = await prisma.user.update({
    where: { id: input.userId },
    data: {
      emailNotifications: input.emailNotifications,
      weeklyDigest: input.emailNotifications && input.weeklyDigest,
    },
    select: { emailNotifications: true, weeklyDigest: true },
  });
  await writeAudit({
    actorId: input.userId,
    action: "user.notification_preferences.update",
    targetType: "User",
    targetId: input.userId,
    after: updated,
  });
  return updated;
}

export async function changePassword(
  userId: string,
  input: z.infer<typeof passwordSchema>,
) {
  const parsed = passwordSchema.parse(input);
  if (parsed.currentPassword === parsed.newPassword) {
    throw new Error("Choose a password you have not already used here");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) throw new Error("Password sign-in is unavailable");
  if (!(await compare(parsed.currentPassword, user.passwordHash))) {
    throw new Error("Current password is incorrect");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hash(parsed.newPassword, 12) },
  });
  await writeAudit({
    actorId: userId,
    action: "user.password.change",
    targetType: "User",
    targetId: userId,
  });
}
