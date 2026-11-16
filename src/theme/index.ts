import { createTheme } from "@mui/material";

export const DARK = {
  bg: "#111512",
  surface: "#191F1A",
  surfaceAlpha: "rgba(25,31,26,0.82)",
  accent: "#E39778",
  accentHover: "#F0AD8E",
  accentForeground: "#1D211D",
  accent2: "#B6C5A7",
  text: "#F6F1E9",
  textSec: "#C0BDB3",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.10)",
  userBubble: "#3B5141",
  sidebar: "rgba(17,21,18,0.92)",
};

export const LIGHT = {
  bg: "#F5F2EC",
  surface: "#FFFDF9",
  surfaceAlpha: "rgba(255,253,249,0.92)",
  accent: "#A6503A",
  accentHover: "#863F2F",
  accentForeground: "#FFFDF9",
  accent2: "#58715A",
  text: "#272822",
  textSec: "#66675D",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(54,47,38,0.10)",
  userBubble: "#37513D",
  sidebar: "rgba(255,253,249,0.94)",
};

export function buildTheme(mode: "dark" | "light") {
  const t = mode === "dark" ? DARK : LIGHT;
  return createTheme({
    palette: {
      mode,
      primary: { main: t.accent, contrastText: t.accentForeground },
      secondary: { main: t.accent2 },
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
    shape: { borderRadius: 10 },
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
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: t.accent,
            "&.Mui-checked": { color: t.accent },
            "&.Mui-checked + .MuiSwitch-track": {
              backgroundColor: t.accent,
              opacity: 0.5,
            },
          },
          track: {
            backgroundColor: "var(--border-glass)",
            opacity: 1,
          },
        },
      },
    },
  });
}
