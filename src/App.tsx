import React from "react";
import { Alert, ThemeProvider, CssBaseline, Box, Typography, Tabs, Tab, useMediaQuery, IconButton, Fab, Snackbar, Button } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon, LogOut, Wand2, MessageCircle, X } from "lucide-react";

import { useAppTheme } from "./hooks/useAppTheme";
import { useArtAnalyzer } from "./hooks/useArtAnalyzer";
import { useBelleChat } from "./hooks/useBelleChat";
import { authClient, useAuthSession } from "./services/authClient";

import { AuroraBackground } from "./components/ui/AuroraBackground";
import { ThemeToggle } from "./components/layout/ThemeToggle";
import { MainContent } from "./components/layout/MainContent";
import { AuthScreen } from "./components/auth/AuthScreen";
import { BelleChatBox } from "./components/chat/BelleChatBox";
import { CurrentTabContent, OptimizedTabContent } from "./components/layout/SidebarContent";
import { PaletteCard } from "./components/palette/PaletteCard";
import { FinalPaletteColor, ChatMessage } from "./services/geminiService";
import { LanguageProvider, useLanguage } from "./i18n";

export default function App() {
  const themeState = useAppTheme();

  return (
    <ThemeProvider theme={themeState.theme}>
      <CssBaseline />
      <LanguageProvider>
        <LocalizedApp themeState={themeState} />
      </LanguageProvider>
    </ThemeProvider>
  );
}

function LocalizedApp({ themeState }: { themeState: ReturnType<typeof useAppTheme> }) {
  const { language, setLanguage, t } = useLanguage();
  const session = useAuthSession();
  const [authError, setAuthError] = React.useState("");

  React.useEffect(() => {
    const onUnauthorized = () => void session.refetch?.();
    window.addEventListener("belleza:unauthorized", onUnauthorized);
    return () => window.removeEventListener("belleza:unauthorized", onUnauthorized);
  }, [session.refetch]);

  const handleSignOut = async () => {
    try {
      const result = await authClient.signOut({});
      if (result.error) {
        setAuthError(t("signOutFailure"));
      }
    } catch {
      setAuthError(t("connectionFailure"));
    }
  };

  return (
    <>
      <Button
        className="language-toggle"
        variant="outlined"
        aria-label={language === "vi" ? t("switchToEnglish") : t("switchToVietnamese")}
        title={language === "vi" ? t("switchToEnglish") : t("switchToVietnamese")}
        onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
        sx={{
          position: "fixed", top: 24, right: 80, zIndex: 100,
          minWidth: 46, width: 46, height: 46, p: 0,
          borderColor: "var(--border-glass)", borderRadius: "50%",
          color: "var(--text-secondary)", background: "var(--glass-bg)",
          backdropFilter: "blur(18px)", fontWeight: 700, fontSize: "0.72rem",
        }}
      >
        {language === "vi" ? "EN" : "VI"}
      </Button>
      {session.isPending ? (
        <Box className="auth-loading" role="status">{t("loadingSession")}</Box>
      ) : session.data?.user ? (
        <BellezaStudio {...themeState} userEmail={session.data.user.email} onSignOut={handleSignOut} />
      ) : (
        <AuthScreen />
      )}
      <Snackbar open={Boolean(authError)} autoHideDuration={5000} onClose={() => setAuthError("")}>
        <Alert severity="error" onClose={() => setAuthError("")}>{authError}</Alert>
      </Snackbar>
    </>
  );
}

function BellezaStudio({
  themeMode,
  theme,
  toggleTheme,
  isDark,
  userEmail,
  onSignOut,
}: ReturnType<typeof useAppTheme> & { userEmail: string; onSignOut: () => void }) {
  const { language, t } = useLanguage();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showMobileSidebar, setShowMobileSidebar] = React.useState(false);
  
  // Custom Hook composition
  const setChatHistoryRef = React.useRef<React.Dispatch<React.SetStateAction<ChatMessage[]>> | null>(null);
  const setChatHistoryGlobal = React.useCallback(
    (fn: React.SetStateAction<ChatMessage[]>) => setChatHistoryRef.current?.(fn),
    [],
  );

  const analyzerProps = useArtAnalyzer(setChatHistoryGlobal, language);
  const {
    imageSrc, base64Image, mimeType, isDragging,
    isAnalyzing, analysisResult, error,
    activeTab, setActiveTab,
    selectedColor, setSelectedColor,
    isSketch
  } = analyzerProps;

  const chatProps = useBelleChat(base64Image, mimeType, analysisResult, language);
  React.useEffect(() => {
    setChatHistoryRef.current = chatProps.setChatHistory;
  }, [chatProps.setChatHistory]);

  const {
    finalReviewText, showPaletteCard, setShowPaletteCard
  } = chatProps;

  const borderCol = "var(--border-glass)";
  const borderSubtle = "var(--border-subtle)";
  const accentCol = "var(--accent)";
  const dragBorderCol = "var(--accent)";
  const dragBg = "var(--accent-subtle)";
  const dragGlow = "0 0 50px var(--accent-glow)";

  const renderSidebarContent = () => (
    <Box sx={{ p: { xs: 2.5, md: 3.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)", display: "flex" }}>
            <ImageIcon size={20} style={{ color: accentCol }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.35rem" }}>{t("workspaceTitle")}</Typography>
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
                "& .Mui-selected": { color: "var(--accent-foreground) !important", background: `var(--accent) !important`, fontWeight: "700 !important" },
              }}
            >
              <Tab value="current" label={isSketch ? t("currentSketchTab") : t("currentTab")} />
              {!isSketch && (
                <Tab value="optimized" label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Wand2 size={13} /><span>{t("optimizedTab")}</span></Box>} />
              )}
              <Tab value="belle" label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><MessageCircle size={13} /><span>{t("belleTab")}</span></Box>} />
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
  );

  return (
    <>
      <AuroraBackground />
      <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
      <IconButton
      className="sign-out-button"
      aria-label={`${t("signOut")} ${userEmail}`}
      title={`${t("signOut")} ${userEmail}`}
        onClick={onSignOut}
        sx={{
        position: "fixed", top: 24, right: 136, zIndex: 100,
          width: 44, height: 44,
          border: "1px solid var(--border-glass)",
          background: "var(--glass-bg)",
          color: "var(--text-secondary)",
          backdropFilter: "blur(16px)",
          "&:hover": { color: "var(--accent)", background: "var(--accent-subtle)" },
        }}
      >
        <LogOut size={18} />
      </IconButton>

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

      <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, height: { xs: "auto", md: "100vh" }, minHeight: "100vh", overflow: { xs: "visible", md: "hidden" } }}>
        
        {/* L Main Upload/Preview  */}
        <MainContent 
          {...analyzerProps} 
          isDark={isDark} accentCol={accentCol} borderCol={borderCol} 
          dragBorderCol={dragBorderCol} dragBg={dragBg} dragGlow={dragGlow}
        />

        {/* R Sidebar Analytics/Chat */}
        <AnimatePresence>
          {(isAnalyzing || analysisResult) && (
            <React.Fragment>
              {!isMobile ? (
                <Box
                  component={motion.aside}
                  custom={{}}
                  key="sidebar" initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 26, stiffness: 200 }}
                  sx={{
                    width: "100%", maxWidth: { xs: "100%", md: 460 }, height: { xs: "auto", md: "100vh" }, minHeight: { xs: "100vh", md: "auto" },
                    overflowY: { xs: "visible", md: "hidden" }, flexShrink: 0, display: "flex", flexDirection: "column",
                    background: "var(--sidebar-bg)", backdropFilter: "blur(40px)", 
                    borderLeft: { xs: "none", md: `1px solid ${borderCol}` }, borderTop: { xs: `1px solid ${borderCol}`, md: "none" },
                    boxShadow: `-16px 0 48px var(--sidebar-shadow)`, transition: "background 0.3s, border-color 0.3s",
                  }}
                >
                  {renderSidebarContent()}
                </Box>
              ) : (
                <AnimatePresence>
                  {showMobileSidebar && (
                    <React.Fragment>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMobileSidebar(false)}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1200 }}
                      />
                      <Box
                        component={motion.div}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                          if (info.offset.y > 100 || info.velocity.y > 500) {
                            setShowMobileSidebar(false);
                          }
                        }}
                        style={{
                          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1300,
                          height: "85vh", borderTopLeftRadius: 24, borderTopRightRadius: 24,
                          background: "var(--sidebar-bg)", backdropFilter: "blur(40px)",
                          borderTop: `1px solid ${borderCol}`, borderLeft: `1px solid ${borderCol}`, borderRight: `1px solid ${borderCol}`,
                          display: "flex", flexDirection: "column",
                          boxShadow: "0 -20px 40px rgba(0,0,0,0.2)"
                        }}
                      >
                        <Box sx={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", flexShrink: 0, pt: 1, pb: 1, cursor: "grab", "&:active": { cursor: "grabbing" } }}>
                          <Box sx={{ width: 48, height: 5, bgcolor: "text.disabled", borderRadius: 3, mt: 1, mb: 1, opacity: 0.8 }} />
                          <IconButton aria-label={t("closePanel")} onClick={() => setShowMobileSidebar(false)} sx={{ position: "absolute", top: 8, right: 12, color: "text.secondary" }}>
                            <X size={20} />
                          </IconButton>
                        </Box>
                        <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                          {renderSidebarContent()}
                        </Box>
                      </Box>
                    </React.Fragment>
                  )}
                </AnimatePresence>
              )}
            </React.Fragment>
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

      {/* Floating Action Button for Mobile Drawer */}
      <AnimatePresence>
        {isMobile && !isAnalyzing && analysisResult && !showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ position: "fixed", bottom: 24, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 2000 }}
          >
            <Fab
              variant="extended"
              aria-label={t("openAnalysis")}
              onClick={() => setShowMobileSidebar(true)}
              sx={{
                background: "var(--accent)", color: "var(--accent-foreground)",
                boxShadow: "0 8px 32px var(--accent-glow)",
                fontWeight: 700, px: 4, py: 3,
                "&:hover": { background: "var(--accent-subtle)", color: "var(--accent)" }
              }}
            >
              <Wand2 style={{ marginRight: 8 }} size={20} aria-hidden="true" /> {t("openAnalysis")}
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
