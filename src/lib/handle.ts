export function formatHandle(handle?: string | null) {
  const value = handle?.trim().replace(/^@+/, "") ?? "";
  return value ? `@${value}` : null;
}
