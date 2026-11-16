import { Paper, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const GlassCard = styled(Paper)(() => ({
  background: "var(--bg-surface-alpha)",
  border: "1px solid var(--border-glass)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  boxShadow: "0 20px 50px -20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
  transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
  "&:hover": {
    borderColor: "var(--border-glass)",
  },
}));

export const AccentButton = styled(Button)(() => ({
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 55%, var(--accent) 100%)",
  color: "var(--accent-foreground)",
  fontWeight: 700,
  borderRadius: 12,
  padding: "11px 26px",
  letterSpacing: "0.02em",
  boxShadow: "0 10px 30px -8px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.25)",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-80%",
    width: "50%",
    height: "100%",
    background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.45), transparent)",
    transform: "skewX(-20deg)",
    transition: "left 0.6s ease",
  },
  "&:hover": {
    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 60%, var(--accent-hover) 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 16px 40px -10px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.3)",
    "&::after": { left: "130%" },
  },
  "&:active": { transform: "translateY(0) scale(0.98)" },
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
}));

export const GhostButton = styled(Button)(() => ({
  background: "var(--glass-bg)",
  border: "1px solid var(--border-glass)",
  color: "var(--text-secondary)",
  borderRadius: 12,
  backdropFilter: "blur(12px)",
  "&:hover": {
    background: "var(--accent-subtle)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
    transform: "translateY(-1px)",
    boxShadow: "0 10px 28px -12px var(--accent-glow)",
  },
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
}));
