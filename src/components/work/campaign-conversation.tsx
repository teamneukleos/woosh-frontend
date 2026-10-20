import { Panel } from "@/components/ui/panel";
import { LiveThread } from "@/components/messages/live-thread";
import { MessageComposer } from "@/components/messages/message-composer";

export function CampaignConversation({
  campaignId,
  conversation,
  currentUserId,
}: {
  campaignId: string;
  conversation?: {
    id: string;
    messages: Array<{
      id: string;
      body: string | null;
      senderUserId: string | null;
      isSystem: boolean;
      createdAt: Date;
    }>;
  };
  currentUserId: string;
}) {
  return (
    <Panel
      title="Campaign messages"
      description="Keep scope, timing, and approval notes on this campaign."
      variant="flush"
      className="overflow-hidden"
    >
      <div className="flex max-h-[28rem] min-h-64 flex-col">
        {conversation ? (
          <LiveThread
            variant="campaign"
            conversationId={conversation.id}
            currentUserId={currentUserId}
            initialMessages={conversation.messages.map((message) => ({
              id: message.id,
              body: message.body,
              senderUserId: message.senderUserId,
              isSystem: message.isSystem,
              createdAt: message.createdAt,
            }))}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface-sunken)]/70 px-4 py-4">
            <p className="m-auto max-w-xs text-center text-sm text-[var(--text-muted)]">
              No messages yet. Start the thread — keep it attached to the work.
            </p>
          </div>
        )}
        {conversation ? (
          <MessageComposer
            conversationId={conversation.id}
            campaignId={campaignId}
            placeholder="Ask a question or share a campaign update"
          />
        ) : null}
      </div>
    </Panel>
  );
}
