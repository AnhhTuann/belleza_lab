import { Paper, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const GlassCard = styled(Paper)(() => ({
  background: "var(--bg-surface-alpha)",
  border: "1px solid var(--border-glass)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  transition: "background 0.3s, border-color 0.3s",
}));

export const AccentButton = styled(Button)(() => ({
  background: "var(--accent)",
  color: "#fff",
  fontWeight: 700,
  borderRadius: 8,
  padding: "10px 24px",
  "&:hover": {
    background: "var(--accent-hover)",
    transform: "translateY(-1px)",
    boxShadow: "0 6px 20px var(--accent-glow)",
  },
  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
}));

export const GhostButton = styled(Button)(() => ({
  background: "var(--glass-bg)",
  border: "1px solid var(--border-glass)",
  color: "var(--text-secondary)",
  borderRadius: 8,
  "&:hover": {
    background: "var(--accent-subtle)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
  },
  transition: "all 0.2s ease",
}));
