import React, { useRef, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { motion } from "motion/react";
import { toPng } from "html-to-image";
import { Download, X } from "lucide-react";
import { AccentButton } from "../ui/StyledComponents";

export const PaletteCard = ({
  image,
  colors,
  critique,
  onClose,
}: {
  image: string;
  colors: any[];
  critique: string;
  onClose: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadCard = () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    toPng(cardRef.current, { cacheBust: true })
      .then((url) => {
        const a = document.createElement("a");
        a.download = "Belleza-Lab-Palette.png";
        a.href = url;
        a.click();
      })
      .finally(() => setIsDownloading(false));
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: "1 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4, md: 6 },
          py: 8,
          width: "100%",
        }}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            width: "100%",
            maxWidth: 960,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: -56,
              right: 0,
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.1)",
              "&:hover": { background: "rgba(255,255,255,0.2)" },
            }}
          >
            <X size={24} />
          </IconButton>
          <Box
            ref={cardRef}
            sx={{
              width: "100%",
              p: { xs: 3, sm: 5 },
              background: "var(--surface)",
              border: "1px solid var(--border-glass)",
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, var(--accent), var(--accent-hover), var(--accent))`,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontFamily: '"Playfair Display", serif',
                mb: 5,
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              Belleza Lab
            </Typography>
            <Box
              sx={{
                mb: 5,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid var(--border-glass)",
                background: "rgba(0,0,0,0.02)",
              }}
            >
              <Box
                component="img"
                src={image}
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  display: "block",
                }}
                alt="Artwork"
                crossOrigin="anonymous"
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: { xs: 1.5, sm: 3 },
                mb: 5,
              }}
            >
              {colors.slice(0, 5).map((c, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: c.hex,
                      border: "2px solid var(--glass-bg)",
                      boxShadow: `0 8px 20px ${c.hex}44`,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {c.hex}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                borderTop: "1px solid var(--border-glass)",
                pt: 5,
                textAlign: "left",
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  color: "var(--text-primary)",
                  lineHeight: 1.8,
                  fontSize: "1.25rem",
                  whiteSpace: "pre-line",
                }}
              >
                {critique.split("\n").map((line, idx) => {
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <React.Fragment key={idx}>
                      {parts.map((p, j) => {
                        if (p.startsWith("**") && p.endsWith("**")) {
                          return (
                            <strong
                              key={j}
                              style={{
                                color: "var(--accent)",
                                fontWeight: 700,
                              }}
                            >
                              {p.slice(2, -2)}
                            </strong>
                          );
                        }
                        return p;
                      })}
                      {idx < critique.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  );
                })}
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "var(--accent)",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Analyzed by Belle · Art Intelligence
              </Typography>
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "var(--accent)",
                }}
              />
            </Box>
          </Box>
          <AccentButton
            onClick={downloadCard}
            disabled={isDownloading}
            startIcon={<Download size={18} />}
            sx={{
              mt: 4,
              py: 1.5,
              px: 5,
              fontSize: "1rem",
              borderRadius: 50,
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }}
          >
            {isDownloading ? "Đang tải..." : "Tải Thẻ Màu"}
          </AccentButton>
        </motion.div>
      </Box>
    </motion.div>
  );
};
