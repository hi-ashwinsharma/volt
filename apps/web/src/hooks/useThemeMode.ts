"use client";

import type { ThemeMode } from "@volt/types";
import { useCallback, useEffect, useState } from "react";

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("volt-theme");
    const initial: ThemeMode =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    setTheme(initial);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(next);
      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem("volt-theme", next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
