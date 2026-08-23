"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex size-9 items-center justify-center rounded-full text-mkt-muted transition-colors hover:bg-mkt-ghost hover:text-mkt-fg"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
    >
      {mounted && !isDark ? (
        <Moon className="size-4" strokeWidth={1.75} />
      ) : (
        <Sun className="size-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
