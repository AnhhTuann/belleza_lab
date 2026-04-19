import { createTheme } from "@mui/material";

export const DARK = {
  bg: "#0A0A0A",
  surface: "#171717",
  surfaceAlpha: "rgba(23,23,23,0.75)",
  accent: "#C29B7A",
  accentHover: "#D1A98A",
  text: "#F9FAFB",
  textSec: "#D1D5DB",
  glass: "rgba(0,0,0,0.40)",
  glassBorder: "rgba(255,255,255,0.08)",
  userBubble: "#1E3A8A",
  sidebar: "rgba(10,10,10,0.92)",
};

export const LIGHT = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlpha: "rgba(255,255,255,0.85)",
  accent: "#111827",
  accentHover: "#1F2937",
  text: "#111827",
  textSec: "#4B5563",
  glass: "rgba(255,255,255,0.80)",
  glassBorder: "rgba(0,0,0,0.05)",
  userBubble: "#1E3A8A",
  sidebar: "rgba(255,255,255,0.92)",
};

export function buildTheme(mode: "dark" | "light") {
  const t = mode === "dark" ? DARK : LIGHT;
  return createTheme({
    palette: {
      mode,
      primary: { main: t.accent },
      secondary: { main: "#6366f1" },
      background: { default: t.bg, paper: t.surfaceAlpha },
      text: { primary: t.text, secondary: t.textSec },
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      fontSize: 16,
      h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      h2: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
      h5: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      h6: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
      subtitle1: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "1rem" },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.01em",
            fontSize: "1rem",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
          },
        },
      },
    },
  });
}
