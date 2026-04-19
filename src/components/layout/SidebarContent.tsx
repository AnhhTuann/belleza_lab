import React from "react";
import { Box, Typography, IconButton, Collapse } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { Droplet, Info, Palette, Sparkles, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "../ui/StyledComponents";
import { ColorFlipCard } from "../palette/ColorFlipCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const CurrentTabContent = ({ isSketch, analysisResult, accentCol }: any) => {
  const [showGuide, setShowGuide] = React.useState(false);

  return (
    <motion.div
      key="current"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
      style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 32 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: accentCol, letterSpacing: "0.15em", fontSize: "0.6rem", display: "flex", alignItems: "center", gap: 0.8, mb: 1.5, fontWeight: 600 }}>
            <Droplet size={12} /> {isSketch ? "Chất liệu đề xuất" : "Chất liệu dự đoán"}
          </Typography>
          <GlassCard sx={{ p: 3, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", top: 8, right: 8, opacity: 0.05 }}><Droplet size={56} /></Box>
            <Typography variant="h6" sx={{ mb: 1, fontSize: "1.3rem" }}>{analysisResult.medium}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", lineHeight: 1.7, fontSize: "1.15rem" }}>
              {analysisResult.mediumDescription}
            </Typography>
          </GlassCard>
        </Box>

        {isSketch && analysisResult.placement_guide && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="overline" sx={{ color: accentCol, letterSpacing: "0.15em", fontSize: "0.6rem", display: "flex", alignItems: "center", gap: 0.8, fontWeight: 600 }}>
                <Info size={12} /> Hướng dẫn tô màu
              </Typography>
              <IconButton onClick={() => setShowGuide(!showGuide)} size="small" sx={{ color: accentCol, p: 0.5 }}>
                {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </IconButton>
            </Box>
            <Collapse in={showGuide}>
              <GlassCard sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, fontFamily: '"Playfair Display", serif', fontStyle: "italic", whiteSpace: "pre-wrap", fontSize: "1.2rem" }}>
                  {analysisResult.placement_guide}
                </Typography>
              </GlassCard>
            </Collapse>
          </Box>
        )}

        <Box>
          <Typography variant="overline" sx={{ color: accentCol, letterSpacing: "0.15em", fontSize: "0.6rem", display: "flex", alignItems: "center", gap: 0.8, mb: 1.5, fontWeight: 600 }}>
            <Palette size={12} /> {isSketch ? "Bảng màu đề xuất" : "Bảng màu hiện tại"}
          </Typography>
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {analysisResult.current_colors.map((color: any, i: number) => {
              const unfit = analysisResult.issue?.unfit_colors?.find((u: any) => u.hex.toLowerCase() === color.hex.toLowerCase());
              return <ColorFlipCard key={i} color={color} unfitInfo={unfit} />;
            })}
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

// ... OptimizedTabContent
export const OptimizedTabContent = ({ analysisResult, selectedColor, setSelectedColor, borderCol }: any) => {
  return (
    <motion.div
      key="optimized"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
      style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 32 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: "#6366f1", letterSpacing: "0.15em", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: 0.8, mb: 1.5, fontWeight: 600 }}>
            <Sparkles size={12} /> Lời khuyên từ Belle
          </Typography>
          <GlassCard sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, fontFamily: '"Playfair Display", serif', fontStyle: "italic", mb: 2.5, fontSize: "1.2rem" }}>
              {analysisResult.issue?.critique}
            </Typography>
            <Typography variant="overline" sx={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
              <CheckCircle size={11} /> Thay thế đề xuất
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {analysisResult.suggestions?.replacement_colors?.map((color: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <motion.div whileHover={{ scale: 1.12, y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: color.hex, border: `1px solid ${borderCol}`, boxShadow: `0 3px 12px ${color.hex}33`, flexShrink: 0 }} />
                    </motion.div>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{color.name}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary", fontSize: "0.7rem" }}>{color.hex}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", fontSize: "0.82rem" }}>{color.why}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </GlassCard>
        </Box>
        <Box>
          <Typography variant="overline" sx={{ color: "#6366f1", letterSpacing: "0.15em", fontSize: "0.6rem", display: "flex", alignItems: "center", gap: 0.8, mb: 1.5, fontWeight: 600 }}>
            <Palette size={12} /> Bảng màu Hoàn mỹ
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5, mb: 2 }}>
            {analysisResult.suggestions?.final_palette?.map((color: any, i: number) => {
              const isSelected = selectedColor?.hex === color.hex;
              return (
                <motion.div
                  key={i} whileHover={{ y: -2 }} 
                  style={{
                    borderRadius: 12, 
                    background: isSelected ? "var(--accent-subtle)" : "var(--bg-surface)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-glass)"}`,
                    boxShadow: isSelected ? "0 4px 20px var(--accent-glow)" : "none",
                    position: "relative", overflow: "hidden", transition: "all 0.25s ease",
                  }}
                >
                  <Box 
                    onClick={() => setSelectedColor(isSelected ? null : color)}
                    sx={{ padding: "16px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }}
                  >
                    <Box sx={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: color.hex, border: "1px solid var(--border-glass)", boxShadow: `0 4px 12px ${color.hex}66`, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.65rem", mb: 0.3 }}>{color.role}</Typography>
                      <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 700, fontSize: "1.15rem", fontFamily: '"Playfair Display", serif' }}>{color.name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"Inter", monospace', fontSize: "0.85rem" }}>{color.hex}</Typography>
                    </Box>
                    <Box sx={{ color: isSelected ? "var(--accent)" : "text.secondary", display: "flex", transition: "transform 0.3s", transform: isSelected ? "rotate(180deg)" : "rotate(0deg)" }}>
                       <ChevronDown size={20} />
                    </Box>
                  </Box>

                  <Collapse in={isSelected}>
                    <Box sx={{ p: 2, pt: 0, pb: 2.5, position: "relative" }}>
                      <Box sx={{ position: "absolute", top: 0, left: 16, width: 3, height: "calc(100% - 24px)", bgcolor: color.hex, borderRadius: 2 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.85rem", mb: 1, pl: 2.5, color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color.hex, border: `1px solid ${borderCol}`, flexShrink: 0 }} />
                        Công thức: {color.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, fontFamily: '"Playfair Display", serif', fontStyle: "italic", pl: 2.5, fontSize: "1.1rem" }}>
                        {color.mixingGuide}
                      </Typography>
                    </Box>
                  </Collapse>
                </motion.div>
              );
            })}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};
