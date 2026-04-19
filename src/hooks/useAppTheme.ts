import { useState, useMemo, useEffect } from "react";
import { buildTheme } from "../theme";

export const useAppTheme = () => {
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("belleza-theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    localStorage.setItem("belleza-theme", themeMode);
  }, [themeMode]);

  const toggleTheme = () =>
    setThemeMode((m) => (m === "dark" ? "light" : "dark"));
  const isDark = themeMode === "dark";

  return { themeMode, theme, toggleTheme, isDark };
};
