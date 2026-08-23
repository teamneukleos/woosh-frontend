export function humanizeKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function flattenTerms(
  value: unknown,
  prefix = "",
): Array<{ label: string; value: string }> {
  if (!value || typeof value !== "object") {
    return value === null || value === undefined
      ? []
      : [{ label: prefix || "Details", value: String(value) }];
  }
  if (Array.isArray(value)) {
    return [
      {
        label: prefix || "Details",
        value: value.map((item) => String(item)).join(", "),
      },
    ];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, item]) => {
      const label = prefix ? `${prefix} · ${humanizeKey(key)}` : humanizeKey(key);
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return flattenTerms(item, label);
      }
      return [
        {
          label,
          value: Array.isArray(item)
            ? item.map((entry) => String(entry)).join(", ")
            : typeof item === "boolean"
              ? item
                ? "Yes"
                : "No"
              : String(item ?? "Not specified"),
        },
      ];
    },
  );
}
