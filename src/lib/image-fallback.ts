import { cartoonAvatar } from "@/lib/cartoon-avatar";

/**
 * Image sources to try in order for a creator avatar: the stored photo (which may be an
 * expired Instagram/Facebook CDN link) first, then the generated cartoon avatar.
 */
export function avatarSources(name: string, src?: string | null) {
  const photo = src?.trim();
  return [...new Set([photo, cartoonAvatar(name)].filter((value): value is string => !!value))];
}

/** Last-resort fallback when no image can be loaded at all. */
export function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
  return letters || "W";
}
