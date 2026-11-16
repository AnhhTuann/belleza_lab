import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useLanguage } from "../../i18n";

export const ArtLoader = () => {
  const { t } = useLanguage();
  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      position: "absolute",
      inset: 0,
      background: "var(--loader-overlay)",
      backdropFilter: "blur(14px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    }}
  >
    <Box sx={{ position: "relative", width: 96, height: 96, mb: 4 }}>
      {/* rotating conic ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 0%, var(--accent) 22%, var(--accent-2) 40%, transparent 60%)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
        }}
      />
      {/* morphing blob */}
      <motion.div
        animate={{
          scale: [1, 1.18, 0.94, 1],
          rotate: [0, 160, 320],
          borderRadius: ["38% 62% 63% 37% / 41% 44% 56% 59%", "63% 37% 41% 59% / 44% 59% 41% 56%", "41% 59% 37% 63% / 56% 41% 59% 44%", "38% 62% 63% 37% / 41% 44% 56% 59%"],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 14,
          background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          filter: "blur(14px)",
          opacity: 0.55,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={30} style={{ color: "var(--accent)" }} />
        </motion.div>
      </Box>
    </Box>
    <Typography
      sx={{
        fontFamily: '"Playfair Display", serif',
        fontStyle: "italic",
        color: "var(--text-primary)",
        fontSize: "1.15rem",
        letterSpacing: "0.02em",
        opacity: 0.9,
      }}
    >
      {t("loaderText")}
    </Typography>
    <Box sx={{ mt: 3, display: "flex", gap: 1.2 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.6, 1], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i === 1 ? "var(--accent-2)" : "var(--accent)",
          }}
        />
      ))}
    </Box>
  </motion.div>
  );
};
