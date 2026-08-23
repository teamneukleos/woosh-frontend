import { prisma } from "@/lib/db";

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char] ?? char,
  );
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(payload: MailPayload) {
  if (!emailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is required to send transactional email in production",
      );
    }
    console.log(
      `[email-stub] to=${payload.to} subject=${payload.subject}`,
    );
    return { id: "stub", provider: "console" as const };
  }

  const from =
    process.env.EMAIL_FROM?.trim() || "Woosh <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend failed", res.status, body);
    throw new Error(`Email send failed: ${res.status}`);
  }

  const json = (await res.json()) as { id: string };
  return { id: json.id, provider: "resend" as const };
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  emailTo?: string;
  dedupeKey?: string;
}) {
  if (input.dedupeKey) {
    const existing = await prisma.notification.findUnique({
      where: { dedupeKey: input.dedupeKey },
    });
    if (existing) return existing;
  }
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      dedupeKey: input.dedupeKey,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true, emailNotifications: true },
  });
  const to = input.emailTo || user?.email;
  if (to && user?.emailNotifications !== false) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = input.href ? `${appUrl}${input.href}` : appUrl;
    try {
      await sendEmail({
        to,
        subject: input.title,
        html: `<p>${escapeHtml(input.body)}</p><p><a href="${escapeHtml(link)}">Open in Woosh</a></p>`,
        text: `${input.body}\n\n${link}`,
      });
    } catch (err) {
      console.error("[email] notification mail failed", err);
    }
  }

  return notification;
}

export async function sendWeeklyNotificationDigests(now = new Date()) {
  const currentWeekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  currentWeekStart.setUTCDate(
    currentWeekStart.getUTCDate() - ((currentWeekStart.getUTCDay() + 6) % 7),
  );
  const previousWeekStart = new Date(
    currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000,
  );
  const weekKey = currentWeekStart.toISOString().slice(0, 10);
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      emailNotifications: true,
      weeklyDigest: true,
    },
    select: { id: true, email: true, name: true },
    take: 1_000,
  });
  const result = { eligible: users.length, sent: 0, skipped: 0, failed: 0 };

  for (const user of users) {
    const auditTarget = `${user.id}:${weekKey}`;
    const alreadySent = await prisma.auditEvent.findFirst({
      where: {
        action: "notification.weekly_digest.sent",
        targetType: "UserWeeklyDigest",
        targetId: auditTarget,
      },
      select: { id: true },
    });
    if (alreadySent) {
      result.skipped += 1;
      continue;
    }
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: previousWeekStart, lt: currentWeekStart },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    if (!notifications.length) {
      result.skipped += 1;
      continue;
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const items = notifications
      .map(
        (notification) =>
          `<li><strong>${escapeHtml(notification.title)}</strong><br>${escapeHtml(notification.body)}</li>`,
      )
      .join("");
    try {
      await sendEmail({
        to: user.email,
        subject: "Your weekly Woosh update",
        html: `<p>Hi ${escapeHtml(user.name || "there")},</p><p>Here is what moved on Woosh this week:</p><ul>${items}</ul><p><a href="${escapeHtml(`${appUrl}/app/notifications`)}">Open notifications</a></p>`,
        text: notifications
          .map(
            (notification) =>
              `${notification.title}: ${notification.body}`,
          )
          .join("\n"),
      });
      await prisma.auditEvent.create({
        data: {
          actorId: user.id,
          action: "notification.weekly_digest.sent",
          targetType: "UserWeeklyDigest",
          targetId: auditTarget,
          metadata: { notificationCount: notifications.length },
        },
      });
      result.sent += 1;
    } catch {
      result.failed += 1;
    }
  }
  return result;
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { readAt: new Date() },
  });
}
