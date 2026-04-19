import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export const ArtLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: "absolute",
      inset: 0,
      background: "var(--loader-overlay)",
      backdropFilter: "blur(12px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    }}
  >
    <Box sx={{ position: "relative", mb: 4 }}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 72,
          height: 72,
          background: "linear-gradient(135deg, var(--accent), #6366f1)",
          filter: "blur(10px)",
          opacity: 0.5,
          borderRadius: "30% 70% 70% 30%",
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
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={26} style={{ color: "var(--accent)" }} />
        </motion.div>
      </Box>
    </Box>
    <Typography
      sx={{
        fontFamily: '"Playfair Display", serif',
        fontStyle: "italic",
        color: "var(--text-primary)",
        fontSize: "1.15rem",
        opacity: 0.85,
      }}
    >
      Belleza Lab đang cảm thụ bức tranh...
    </Typography>
    <Box sx={{ mt: 2.5, display: "flex", gap: 1 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--accent)",
          }}
        />
      ))}
    </Box>
  </motion.div>
);
