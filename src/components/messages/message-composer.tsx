"use client";

import { useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  sendCampaignMessageAction,
  sendMessageAction,
} from "@/app/actions";

export function MessageComposer({
  conversationId,
  campaignId,
  placeholder = "Write a message",
}: {
  conversationId: string;
  campaignId?: string;
  placeholder?: string;
}) {
  const field = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <form
      action={campaignId ? sendCampaignMessageAction : sendMessageAction}
      className="flex items-end gap-2 border-t border-[var(--woosh-border)] bg-white p-3 sm:p-4"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      {campaignId ? (
        <input type="hidden" name="campaignId" value={campaignId} />
      ) : null}
      <label className="sr-only" htmlFor={`message-body-${conversationId}`}>
        Message
      </label>
      <textarea
        ref={field}
        id={`message-body-${conversationId}`}
        name="body"
        required
        maxLength={5000}
        rows={1}
        placeholder={placeholder}
        onInput={resize}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="max-h-40 min-h-11 min-w-0 flex-1 resize-none rounded-[var(--radius-control)] border border-[var(--woosh-border)] bg-[var(--surface-sunken)] px-3 py-2.5 text-sm leading-5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--woosh-blue)] focus:bg-white focus:shadow-[var(--shadow-focus)]"
      />
      <Button type="submit" size="icon" aria-label="Send message">
        <Send aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}
