import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion, useMotionValue } from "motion/react";
import { AlertTriangle, Droplet } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any },
  },
};

export const ColorFlipCard: React.FC<{ color: any; unfitInfo: any }> = ({
  color,
  unfitInfo,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  return (
    <motion.div
      variants={itemVariants}
      style={{
        perspective: 1000,
        cursor: "pointer",
        minHeight: 220,
        position: "relative",
      }}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Front */}
        <Box
          className="backface-hidden"
          sx={{
            position: "absolute",
            inset: 0,
            background: "var(--bg-surface-alpha)",
            border: `1px solid ${unfitInfo ? "var(--error-border)" : "var(--border-glass)"}`,
            backdropFilter: "blur(16px)",
            borderRadius: 1.5,
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            "&:hover": { borderColor: "var(--accent)" },
            transition: "all 0.25s",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <motion.div
              whileHover={{ scale: 1.08, y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: color.hex,
                border: "2px solid var(--border-glass)",
                boxShadow: `0 6px 20px ${color.hex}44`,
              }}
            />
            {unfitInfo && (
              <Box
                sx={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: "#ef4444",
                  borderRadius: "50%",
                  p: 0.4,
                  display: "flex",
                }}
              >
                <AlertTriangle size={11} color="white" />
              </Box>
            )}
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                textTransform: "capitalize",
                mb: 0.3,
                fontSize: "1.2rem",
              }}
            >
              {color.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Inter", monospace',
                color: "var(--text-secondary)",
                background: "var(--chip-bg)",
                px: 1,
                py: 0.3,
                borderRadius: 1,
                display: "block",
                fontSize: "1rem",
              }}
            >
              {color.hex}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "0.8rem",
              position: "absolute",
              bottom: 10,
            }}
          >
            Nhấn để xem công thức
          </Typography>
        </Box>

        {/* Back */}
        <Box
          className="backface-hidden"
          sx={{
            position: "absolute",
            inset: 0,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-glass)",
            backdropFilter: "blur(20px)",
            borderRadius: 1.5,
            p: 2.5,
            transform: "rotateY(180deg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
              pb: 1.5,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: color.hex,
                flexShrink: 0,
                border: "1px solid var(--border-glass)",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "1rem",
              }}
            >
              {color.name}
            </Typography>
          </Box>
          {unfitInfo && (
            <Box
              sx={{
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                borderRadius: 2,
                p: 1.2,
                mb: 1.5,
                display: "flex",
                gap: 1,
              }}
            >
              <AlertTriangle
                size={11}
                style={{
                  color: "var(--error-text)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "var(--error-text)", fontSize: "0.9rem" }}
              >
                {unfitInfo.reason}
              </Typography>
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontSize: "0.8rem",
              fontWeight: 700,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Droplet size={10} /> Công thức
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              fontFamily: '"Playfair Display", serif',
              fontStyle: "italic",
              fontSize: "1.1rem",
              overflow: "auto",
              flex: 1,
            }}
          >
            {color.mixingGuide}
          </Typography>
        </Box>
      </motion.div>
    </motion.div>
  );
};
