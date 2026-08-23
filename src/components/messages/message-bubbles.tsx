import { cn } from "@/lib/cn";
import { formatDayLabel, formatMessageStamp, sameDay } from "@/domains/messaging/presentation";

export type BubbleMessage = {
  id: string;
  body: string | null;
  senderUserId: string | null;
  isSystem: boolean;
  createdAt: Date;
};

export function MessageBubbles({
  messages,
  currentUserId,
}: {
  messages: BubbleMessage[];
  currentUserId: string;
}) {
  if (!messages.length) {
    return (
      <p className="m-auto max-w-xs text-center text-sm text-[var(--text-muted)]">
        No messages yet. Start the thread — keep it attached to the work.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {messages.map((message, index) => {
        const mine = message.senderUserId === currentUserId && !message.isSystem;
        const previous = messages[index - 1];
        const showDay =
          !previous || !sameDay(previous.createdAt, message.createdAt);
        return (
          <li key={message.id} className="flex flex-col gap-2">
            {showDay ? (
              <p className="py-2 text-center text-[0.6875rem] font-medium text-[var(--text-muted)]">
                {formatDayLabel(message.createdAt)}
              </p>
            ) : null}
            <div
              className={cn(
                "max-w-[min(32rem,88%)] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-[0_1px_1px_rgb(18_20_26_/_0.04)]",
                message.isSystem
                  ? "mx-auto max-w-md rounded-lg bg-white/80 px-3 py-1.5 text-center text-xs text-[var(--text-muted)] shadow-none"
                  : mine
                    ? "ml-auto rounded-br-md bg-[var(--woosh-blue)] text-white"
                    : "rounded-bl-md bg-white text-[var(--text-primary)]",
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
              {message.isSystem ? null : (
                <time
                  dateTime={message.createdAt.toISOString()}
                  className={cn(
                    "mt-1 block text-[0.625rem]",
                    mine ? "text-white/70" : "text-[var(--text-muted)]",
                  )}
                >
                  {formatMessageStamp(message.createdAt)}
                </time>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
