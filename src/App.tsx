import React, { useMemo } from "react";
import { ThemeProvider, CssBaseline, Box, Typography, Tabs, Tab } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon, Wand2, MessageCircle } from "lucide-react";

import { useAppTheme } from "./hooks/useAppTheme";
import { useArtAnalyzer } from "./hooks/useArtAnalyzer";
import { useBelleChat } from "./hooks/useBelleChat";

import { AuroraBackground } from "./components/ui/AuroraBackground";
import { ThemeToggle } from "./components/layout/ThemeToggle";
import { MainContent } from "./components/layout/MainContent";
import { BelleChatBox } from "./components/chat/BelleChatBox";
import { CurrentTabContent, OptimizedTabContent } from "./components/layout/SidebarContent";
import { PaletteCard } from "./components/palette/PaletteCard";
import { FinalPaletteColor, ChatMessage } from "./services/geminiService";

export default function App() {
  const { themeMode, theme, toggleTheme, isDark } = useAppTheme();
  
  // Custom Hook composition
  let setChatHistoryGlobal: React.Dispatch<React.SetStateAction<ChatMessage[]>> = () => {};
  
  const analyzerProps = useArtAnalyzer((fn) => setChatHistoryGlobal(fn));
  const {
    imageSrc, base64Image, mimeType, isDragging,
    isAnalyzing, analysisResult, error,
    activeTab, setActiveTab,
    selectedColor, setSelectedColor,
    isSketch
  } = analyzerProps;

  const chatProps = useBelleChat(base64Image, mimeType, analysisResult);
  setChatHistoryGlobal = chatProps.setChatHistory;

  const {
    finalReviewText, showPaletteCard, setShowPaletteCard
  } = chatProps;

  const borderCol = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const borderSubtle = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const accentCol = isDark ? "#D4AF37" : "#B8860B";
  const dragBorderCol = isDark ? "#D4AF37" : "#B8860B";
  const dragBg = isDark ? "rgba(212,175,55,0.05)" : "rgba(184,134,11,0.04)";
  const dragGlow = isDark ? "0 0 40px rgba(212,175,55,0.15)" : "0 0 30px rgba(184,134,11,0.08)";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuroraBackground />
      <ThemeToggle mode={themeMode} onToggle={toggleTheme} />

      <AnimatePresence>
        {imageSrc && (
          <motion.div
            key="img-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{
              position: "fixed", inset: 0, zIndex: 0, backgroundImage: `url(${imageSrc})`,
              backgroundSize: "cover", backgroundPosition: "center",
              filter: "blur(120px) saturate(0.35)", opacity: isDark ? 0.06 : 0.04,
            }}
          />
        )}
      </AnimatePresence>

      <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, height: "100vh", overflow: "hidden" }}>
        
        {/* L Main Upload/Preview  */}
        <MainContent 
          {...analyzerProps} 
          isDark={isDark} accentCol={accentCol} borderCol={borderCol} 
          dragBorderCol={dragBorderCol} dragBg={dragBg} dragGlow={dragGlow}
        />

        {/* R Sidebar Analytics/Chat */}
        <AnimatePresence>
          {(isAnalyzing || analysisResult) && (
            <motion.aside
              key="sidebar" initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
              style={{
                width: "100%", maxWidth: 460, height: "100vh", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column",
                background: "var(--sidebar-bg)", backdropFilter: "blur(40px)", borderLeft: `1px solid ${borderCol}`,
                boxShadow: `-16px 0 48px var(--sidebar-shadow)`, transition: "background 0.3s, border-color 0.3s",
              }}
            >
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, background: "var(--accent-subtle)", border: `1px solid ${accentCol}22`, display: "flex" }}>
                      <ImageIcon size={20} style={{ color: accentCol }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.35rem" }}>Khai phá Nghệ thuật</Typography>
                  </Box>
                </motion.div>

                {isAnalyzing ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[72, 90, 90, 0].map((h, i) =>
                      h ? <Box key={i} className="shimmer" sx={{ height: h, borderRadius: 2 }} /> 
                        : <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
                            {[0, 1, 2, 3].map((j) => <Box key={j} className="shimmer" sx={{ height: 120, borderRadius: 2 }} />)}
                          </Box>
                    )}
                  </Box>
                ) : analysisResult ? (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ mb: 3, background: "var(--chip-bg)", borderRadius: 2.5, p: 0.5, border: `1px solid ${borderSubtle}` }}>
                      <Tabs
                        value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" slotProps={{ indicator: { style: { display: "none" } } } as any}
                        sx={{
                          minHeight: 38,
                          "& .MuiTab-root": { minHeight: 42, borderRadius: 2, color: "text.secondary", transition: "all 0.25s", fontSize: "1.05rem" },
                          "& .Mui-selected": { color: "#fff !important", background: `var(--accent) !important`, fontWeight: "700 !important" },
                        }}
                      >
                        <Tab value="current" label={isSketch ? "Bản vẽ" : "Hiện tại"} />
                        {!isSketch && (
                          <Tab value="optimized" label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Wand2 size={13} /><span>Tối ưu</span></Box>} />
                        )}
                        <Tab value="belle" label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><MessageCircle size={13} /><span>Belle</span></Box>} />
                      </Tabs>
                    </Box>

                    <Box sx={{ flex: 1, position: "relative" }}>
                      <AnimatePresence mode="wait">
                        {activeTab === "current" && <CurrentTabContent isSketch={isSketch} analysisResult={analysisResult} accentCol={accentCol} />}
                        {!isSketch && activeTab === "optimized" && <OptimizedTabContent analysisResult={analysisResult} selectedColor={selectedColor} setSelectedColor={setSelectedColor} borderCol={borderCol} />}
                        {activeTab === "belle" && <BelleChatBox {...chatProps} accentCol={accentCol} borderCol={borderCol} borderSubtle={borderSubtle} />}
                      </AnimatePresence>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </motion.aside>
          )}
        </AnimatePresence>
      </Box>

      {/* Result Download view */}
      <AnimatePresence>
        {showPaletteCard && imageSrc && analysisResult?.suggestions && finalReviewText && (
          <PaletteCard
            image={imageSrc}
            colors={analysisResult.suggestions.final_palette}
            critique={finalReviewText}
            onClose={() => setShowPaletteCard(false)}
          />
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
