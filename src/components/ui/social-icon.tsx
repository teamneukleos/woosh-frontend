import { useId } from "react";
import { cn } from "@/lib/cn";

export const SOCIAL_ICON_CHANNELS = [
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "FACEBOOK",
  "X",
  "THREADS",
  "PINTEREST",
  "SNAPCHAT",
] as const;

export type SocialIconChannel = (typeof SOCIAL_ICON_CHANNELS)[number];

const labels: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  X: "X",
  THREADS: "Threads",
  PINTEREST: "Pinterest",
  SNAPCHAT: "Snapchat",
};

export function socialLabel(channel?: string | null) {
  if (!channel) return null;
  return labels[channel] ?? channel.replaceAll("_", " ");
}

const sizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

export function SocialIcon({
  channel,
  size = "md",
  tone = "brand",
  className,
}: {
  channel: string;
  size?: keyof typeof sizes;
  tone?: "brand" | "mono";
  className?: string;
}) {
  const cls = cn(sizes[size], "shrink-0", className);
  if (tone === "mono") {
    return <MonoMark channel={channel} className={cls} />;
  }
  switch (channel) {
    case "INSTAGRAM":
      return <InstagramMark className={cls} />;
    case "TIKTOK":
      return <TikTokMark className={cls} />;
    case "YOUTUBE":
      return <YouTubeMark className={cls} />;
    case "FACEBOOK":
      return <FacebookMark className={cls} />;
    case "X":
      return <XMark className={cls} />;
    case "THREADS":
      return <ThreadsMark className={cls} />;
    case "PINTEREST":
      return <PinterestMark className={cls} />;
    case "SNAPCHAT":
      return <SnapchatMark className={cls} />;
    default:
      return null;
  }
}

function MonoMark({ channel, className }: { channel: string; className?: string }) {
  const path =
    {
      INSTAGRAM:
        "M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5Zm0 1.5A3 3 0 0 0 5 8v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm4 2.8a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4Zm0 1.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM16.7 6.4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z",
      TIKTOK:
        "M14.2 3.2c.7 2.4 2.4 4.1 4.8 4.7v3.1c-1.6.1-3.1-.4-4.4-1.3v6.6c0 3.3-2.6 6-5.9 6.1-3.4 0-6.1-2.8-6.1-6.2s2.7-6.2 6.1-6.2c.4 0 .8 0 1.1.1v3.2c-.3-.1-.7-.2-1.1-.2-1.6 0-2.9 1.3-2.9 3 0 1.6 1.3 3 2.9 3s2.8-1.3 2.8-3V3.2h2.7Z",
      YOUTUBE:
        "M21.6 7.2a2.8 2.8 0 0 0-2-2C18 4.8 12 4.8 12 4.8s-6 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.6.4 7.6.4 7.6.4s6 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.2V8.8L15.6 12 10 15.2Z",
      FACEBOOK:
        "M14.8 8.4V6.8c0-.7.5-1 1.1-1h1.6V3h-2.2C12.4 3 11 4.6 11 6.9v1.5H9.2V11H11v10h3.2v-10h2.2l.4-2.6h-2.6Z",
      X: "M13.7 10.5 20.4 3h-1.6l-5.8 6.5L8.3 3H3.2l7 10.1L3.2 21h1.6l6.1-6.9 4.9 6.9h5.1L13.7 10.5Zm-2.2 2.4-.7-1L5.4 4.2h2.4l4.5 6.4.7 1 5.9 8.3h-2.4l-4.9-7Z",
      THREADS: THREADS_PATH,
      PINTEREST: PINTEREST_P_PATH,
      SNAPCHAT: SNAPCHAT_GHOST_PATH,
    }[channel];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

export function ChannelMark({
  channel,
  size = "md",
  className,
}: {
  channel?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (!channel) return null;
  const label = socialLabel(channel);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <SocialIcon channel={channel} size={size} />
      <span>{label}</span>
    </span>
  );
}

export function SocialLogoRow({
  channels = SOCIAL_ICON_CHANNELS,
  className,
}: {
  channels?: readonly string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-3", className)}>
      {channels.map((channel) => (
        <li key={channel} title={socialLabel(channel) ?? channel}>
          <SocialIcon channel={channel} size="lg" />
        </li>
      ))}
    </ul>
  );
}

function InstagramMark({ className }: { className?: string }) {
  const id = `ig${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="30%" cy="110%" r="120%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="100%" stopColor="#d6249f" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill={`url(#${id})`} />
      <rect
        x="6.2"
        y="6.2"
        width="11.6"
        height="11.6"
        rx="3.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.4" cy="7.6" r="1" fill="#fff" />
    </svg>
  );
}

function TikTokMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6" fill="#111" />
      <path
        fill="#25F4EE"
        d="M14.1 5.1c.5 1.8 1.8 3.2 3.6 3.7v2.2c-1.2.1-2.4-.3-3.4-1v5.2c0 2.6-2.1 4.7-4.7 4.7S5 17.8 5 15.2s2.1-4.7 4.7-4.7c.3 0 .6 0 .9.1v2.4c-.3-.1-.6-.2-.9-.2-1.3 0-2.3 1-2.3 2.4s1 2.4 2.3 2.4 2.2-1 2.2-2.4V5.1h2.2Z"
      />
      <path
        fill="#FE2C55"
        d="M13.4 5.8c.5 1.8 1.8 3.2 3.6 3.7v2.2c-1.2.1-2.4-.3-3.4-1v5.2c0 2.6-2.1 4.7-4.7 4.7-.4 0-.8-.1-1.2-.2 1 .9 2.4 1.4 3.8 1.4 2.6 0 4.7-2.1 4.7-4.7V5.8h-2.8Z"
      />
      <path
        fill="#fff"
        d="M13.9 5.1c.5 1.8 1.8 3.2 3.6 3.7v2.2c-1.2.1-2.4-.3-3.4-1v5.2c0 2.6-2.1 4.7-4.7 4.7S4.8 17.8 4.8 15.2s2.1-4.7 4.7-4.7c.3 0 .6 0 .9.1v2.4c-.3-.1-.6-.2-.9-.2-1.3 0-2.3 1-2.3 2.4s1 2.4 2.3 2.4 2.2-1 2.2-2.4V5.1h2.2Z"
      />
    </svg>
  );
}

function YouTubeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path fill="#fff" d="M9.8 8.2v7.6L16.4 12 9.8 8.2Z" />
    </svg>
  );
}

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.6 12.4h-2.2v7.1H10.4v-7.1H8.8V9.8h1.6V8.3c0-1.4.7-3.5 3.5-3.5h2.1v2.5h-1.5c-.3 0-.8.1-.8.9v1.6h2.4l-.5 2.6Z"
      />
    </svg>
  );
}

function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6" fill="#111" />
      <path
        fill="#fff"
        d="M13.3 11.2 18.6 5h-1.3l-4.6 5.4L9 5H4.8l5.6 8.1L4.8 19h1.3l4.9-5.7L15 19h4.2l-5.9-7.8Zm-1.7 2-.6-.8-4.5-6.3h1.9l3.6 5.1.6.8 4.7 6.6h-1.9l-3.8-5.4Z"
      />
    </svg>
  );
}

const SNAPCHAT_GHOST_PATH =
  "M12 4.15c2.15 0 3.85 1.7 3.85 4.05 0 1.2.08 2.15.55 2.85.3.45.75.7 1.2.7.2 0 .38-.04.48-.08.12.38-.15.7-.58.8-.12.04-.22.16-.22.36 0 .14.05.32.18.5.32.45.82 1.05 1.22 1.55.2.26.08.58-.26.58-.48 0-1.08-.32-1.65-.62-.4.22-1.02.48-1.7.48-.62 0-1.15-.18-1.55-.4-.4.22-.93.4-1.55.4-.68 0-1.3-.26-1.7-.48-.57.3-1.17.62-1.65.62-.34 0-.46-.32-.26-.58.4-.5.9-1.1 1.22-1.55.13-.18.18-.36.18-.5 0-.2-.1-.32-.22-.36-.43-.1-.7-.42-.58-.8.1.04.28.08.48.08.45 0 .9-.25 1.2-.7.47-.7.55-1.65.55-2.85C8.15 5.85 9.85 4.15 12 4.15Z";

const THREADS_PATH =
  "M12.19 0C8.61.02 5.86 1.2 4 3.51 2.35 5.56 1.5 8.41 1.47 12v.02c.03 3.58.88 6.43 2.53 8.48C5.86 22.8 8.61 23.98 12.18 24h.01c2.75-.02 5.04-.73 6.83-2.1 1.68-1.29 2.86-3.13 3.51-5.47l-2.04-.57c-1.1 3.96-3.9 5.98-8.3 6.02-2.91-.02-5.11-.94-6.54-2.72-1.37-1.67-2.06-4.08-2.07-6.99.02-2.91.7-5.33 2.07-7.21C6.08 3.04 8.28 2.04 11.19 2.02c2.22 0 4.03.55 5.4 1.62 1.46 1.15 2.29 2.77 2.48 4.81l.01.14h-2.16l-.01-.13c-.13-1.24-.63-2.19-1.5-2.84C14.75 4.33 13.6 4 12.19 4c-1.73 0-3.14.57-4.19 1.68-1.12 1.19-1.69 2.8-1.7 4.8.01 2 .58 3.61 1.7 4.8 1.05 1.12 2.46 1.68 4.19 1.68 1.27 0 2.35-.28 3.21-.85.97-.64 1.47-1.78 1.38-3.2l-.13-2.2c1.05.16 1.75.6 2.07 1.31.53 1.17.56 3.15-1.09 4.76-1.44 1.41-3.18 2.03-5.8 2.05-2.91-.02-5.11-.94-6.54-2.72C4.31 15.5 3.62 13.08 3.59 12c.03-3.09.72-5.5 2.06-7.16C7.08 2.96 9.28 2.04 12.19 2.02h.01c4.41.03 7.2 2.06 8.3 6.02l2.04-.57C21.9 5.23 20.72 3.39 19.04 2.1 17.26.73 14.96.02 12.21 0h-.02Zm2.69 11.99c-.06-1.01-.37-1.76-.92-2.22-.55-.46-1.3-.69-2.25-.69-1.21 0-2.16.39-2.82 1.17-.69.82-1.05 1.99-1.06 3.48.01 1.5.37 2.67 1.06 3.49.66.78 1.61 1.17 2.82 1.17.94 0 1.7-.23 2.25-.69.55-.46.86-1.21.92-2.22Z";

const PINTEREST_P_PATH =
  "M12 2.2A9.8 9.8 0 0 0 8.1 20.4c.15-.8.4-2 .75-2.9l2.5-9.6s-.35-.7-.35-1.7c0-1.6.9-2.8 2.05-2.8 1 0 1.45.75 1.45 1.65 0 1-.6 2.55-.9 3.95-.25 1.1.55 2 1.7 2 2.05 0 3.5-2.6 3.5-5.75 0-2.4-1.6-4.2-4.55-4.2-3.3 0-5.35 2.5-5.35 5.3 0 1 .35 2.1.85 2.7.1.15.1.3.05.4l-.3 1.25c-.05.25-.2.3-.4.15-1.35-.6-2.05-2.2-2.05-4 0-3.25 2.75-7.1 8.1-7.1 4.35 0 7.2 3.1 7.2 6.5 0 4.45-2.5 7.8-6.15 7.8-1.25 0-2.4-.65-2.8-1.5l-.8 3.1c-.3 1.15-.95 2.3-1.4 3.1A9.8 9.8 0 1 0 12 2.2Z";

function BrandTile({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={cn("rounded-[22%] object-cover", className)} />
  );
}

function ThreadsMark({ className }: { className?: string }) {
  return <BrandTile src="/marketing/social/threads.png" className={className} />;
}

function PinterestMark({ className }: { className?: string }) {
  return <BrandTile src="/marketing/social/pinterest.png" className={className} />;
}

function SnapchatMark({ className }: { className?: string }) {
  return <BrandTile src="/marketing/social/snapchat.png" className={className} />;
}
