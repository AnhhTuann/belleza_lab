import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Lock, Mail, Palette, Sparkles, User } from "lucide-react";
import { authClient } from "../../services/authClient";
import { useLanguage } from "../../i18n";
import { AuroraBackground } from "../ui/AuroraBackground";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: "var(--select-bg)",
    transition: "all 0.25s ease",
    "& fieldset": { borderColor: "var(--border-glass)" },
    "&:hover fieldset": { borderColor: "var(--accent)" },
    "&.Mui-focused fieldset": { borderColor: "var(--accent)", borderWidth: "1.5px" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px var(--accent-glow)" },
  },
  "& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    "&.Mui-focused": { color: "var(--accent)" },
  },
  "& input": { color: "var(--text-primary)", fontSize: "0.92rem", py: "10px" },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px var(--bg-surface) inset",
    WebkitTextFillColor: "var(--text-primary)",
  },
};

export const AuthScreen = () => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name: name.trim() || email.split("@")[0] || "Artist",
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message || t("authFailure"));
      }
    } catch {
      setError(t("authConnectionFailure"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="auth-page">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Box className="auth-layout">
          <Box className="auth-story">
            <Box className="auth-brand">
              <span className="auth-brand-mark"><Palette size={18} /></span>
              <span>Belleza <b>Lab</b></span>
            </Box>
            <Box className="auth-story-copy">
              <Typography className="auth-eyebrow">{t("studioEyebrow")}</Typography>
              <Typography component="h1" className="auth-story-title">{t("authStoryTitle")}</Typography>
              <Typography className="auth-story-description">{t("studioDescription")}</Typography>
            </Box>
            <Box className="auth-moodboard" aria-hidden="true">
              <Box className="moodboard-label"><span>01</span> {t("authMoodboardLabel")}</Box>
              <Box className="moodboard-art">
                <Box className="moodboard-sun" />
                <Box className="moodboard-horizon" />
                <Box className="moodboard-stem" />
              </Box>
              <Box className="moodboard-swatches">
                <span /><span /><span /><span /><span />
              </Box>
              <Typography className="moodboard-caption">{t("authMoodboardCaption")}</Typography>
            </Box>
          </Box>

          <Box className="auth-card">
            <Box className="auth-mark"><Palette size={20} /></Box>
            <Box>
              <Typography className="auth-eyebrow">BELLEZA LAB · ART STUDIO</Typography>
              <Typography variant="h1" className="auth-title">
                {isSignUp ? t("authCreateTitle") : t("authWelcomeBack")}
              </Typography>
              <Typography className="auth-description">
                {t("authDescription")}
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} className="auth-form">
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  key="display-name"
                  initial={{ opacity: 0, height: 0, marginBottom: -16 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: -16 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden", paddingTop: 10 }}
                >
                  <TextField
                    label={t("displayName")}
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    fullWidth
                    sx={inputSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <User size={16} style={{ color: "var(--text-muted)" }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <TextField
              label={t("email")}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              fullWidth
              sx={inputSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={16} style={{ color: "var(--text-muted)" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label={t("password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              slotProps={{
                htmlInput: { minLength: 8, maxLength: 128 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={16} style={{ color: "var(--text-muted)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--accent)" } }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              helperText={isSignUp ? t("passwordHint") : undefined}
              required
              fullWidth
              sx={inputSx}
            />
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0, marginBottom: -16 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: -16 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden", paddingTop: 10 }}
                >
                  <TextField
                    label={t("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    slotProps={{
                      htmlInput: { minLength: 8, maxLength: 128 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={16} style={{ color: "var(--text-muted)" }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={Boolean(confirmPassword) && confirmPassword !== password}
                    helperText={
                      Boolean(confirmPassword) && confirmPassword !== password
                        ? t("passwordMismatch")
                        : undefined
                    }
                    required={isSignUp}
                    fullWidth
                    sx={inputSx}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Alert severity="error" sx={{ borderRadius: "10px" }}>{error}</Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              fullWidth
              className="auth-submit"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
            >
              {isSubmitting ? t("processing") : isSignUp ? t("createAccount") : t("login")}
            </Button>
            </Box>

            <Typography className="auth-switch">
              {isSignUp ? t("hasAccount") : t("noAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp((value) => !value);
                  setError("");
                }}
              >
                {isSignUp ? t("login") : t("createAccount")}
              </button>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};
