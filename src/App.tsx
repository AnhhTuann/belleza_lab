import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Tabs,
  Tab,
  TextField,
  Avatar,
  Chip,
  Zoom,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "motion/react";
import imageCompression from "browser-image-compression";
import chroma from "chroma-js";
import { toPng } from "html-to-image";
import {
  UploadCloud,
  Image as ImageIcon,
  Palette,
  Droplet,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Wand2,
  CheckCircle,
  Info,
  MessageCircle,
  Send,
  Award,
  Download,
  X,
  Sun,
  Moon,
} from "lucide-react";
import {
  analyzeArt,
  ArtAnalysisResult,
  FinalPaletteColor,
  chatWithBelle,
  ChatMessage,
} from "./services/geminiService";

// ─── THEME FACTORIES ─────────────────────────────────────────
const DARK = {
  bg: "#121417",
  surface: "#1E2126",
  surfaceAlpha: "rgba(30,33,38,0.75)",
  accent: "#D4AF37",
  accentHover: "#E5C04B",
  text: "#F3F4F6",
  textSec: "#9CA3AF",
  glass: "rgba(0,0,0,0.30)",
  glassBorder: "rgba(255,255,255,0.10)",
  userBubble: "#2563eb",
  sidebar: "rgba(18,20,23,0.92)",
};
const LIGHT = {
  bg: "#FBF9F6",
  surface: "#FFFFFF",
  surfaceAlpha: "rgba(255,255,255,0.80)",
  accent: "#B8860B",
  accentHover: "#996F09",
  text: "#1F2937",
  textSec: "#6B7280",
  glass: "rgba(255,255,255,0.60)",
  glassBorder: "rgba(0,0,0,0.05)",
  userBubble: "#2563eb",
  sidebar: "rgba(255,255,255,0.92)",
};

function buildTheme(mode: "dark" | "light") {
  const t = mode === "dark" ? DARK : LIGHT;
  return createTheme({
    palette: {
      mode,
      primary: { main: t.accent },
      secondary: { main: "#6366f1" },
      background: { default: t.bg, paper: t.surfaceAlpha },
      text: { primary: t.text, secondary: t.textSec },
    },
    typography: {
      fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
      fontSize: 16,
      h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700 },
      h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
      h5: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700 },
      h6: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
      subtitle1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700 },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "1rem" },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            fontWeight: 600,
            letterSpacing: "0.01em",
            fontSize: "1rem",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            fontWeight: 600,
            fontSize: "1rem",
          },
        },
      },
    },
  });
}

// ─── STYLED COMPONENTS ───────────────────────────────────────
const GlassCard = styled(Paper)(() => ({
  background: "var(--bg-surface-alpha)",
  border: "1px solid var(--border-glass)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  transition: "background 0.3s, border-color 0.3s",
}));

const AccentButton = styled(Button)(() => ({
  background: "var(--accent)",
  color: "#fff",
  fontWeight: 700,
  borderRadius: 50,
  padding: "10px 24px",
  "&:hover": {
    background: "var(--accent-hover)",
    transform: "translateY(-1px)",
    boxShadow: "0 6px 20px var(--accent-glow)",
  },
  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
}));

const GhostButton = styled(Button)(() => ({
  background: "var(--glass-bg)",
  border: "1px solid var(--border-glass)",
  color: "var(--text-secondary)",
  borderRadius: 50,
  "&:hover": {
    background: "var(--accent-subtle)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
  },
  transition: "all 0.2s ease",
}));

// ─── ANIMATION VARIANTS ──────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any },
  },
};

// ─── AURORA BACKGROUND ───────────────────────────────────────
const AuroraBackground = () => (
  <div className="aurora-bg dot-grid">
    <div className="aurora-orb aurora-orb-1" />
    <div className="aurora-orb aurora-orb-2" />
    <div className="aurora-orb aurora-orb-3" />
  </div>
);

// ─── THEME TOGGLE ────────────────────────────────────────────
const ThemeToggle: React.FC<{
  mode: "dark" | "light";
  onToggle: () => void;
}> = ({ mode, onToggle }) => (
  <motion.button
    className="theme-toggle"
    onClick={onToggle}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    aria-label="Toggle theme"
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </motion.div>
    </AnimatePresence>
  </motion.button>
);

// ─── ART LOADER ──────────────────────────────────────────────
const ArtLoader = () => (
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
        fontFamily: '"Cormorant Garamond", serif',
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

// ─── COLOR FLIP CARD ─────────────────────────────────────────
const ColorFlipCard: React.FC<{ color: any; unfitInfo: any }> = ({
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
            borderRadius: 3,
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
                fontFamily: '"DM Sans", monospace',
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
            borderRadius: 3,
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
              fontFamily: '"Cormorant Garamond", serif',
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

// ─── PALETTE CARD (Downloadable) ─────────────────────────────
const PaletteCard = ({
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
                fontFamily: '"Cormorant Garamond", serif',
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
                  fontFamily: '"Cormorant Garamond", serif',
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("belleza-theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    localStorage.setItem("belleza-theme", themeMode);
  }, [themeMode]);

  const toggleTheme = () =>
    setThemeMode((m) => (m === "dark" ? "light" : "dark"));
  const isDark = themeMode === "dark";

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<ArtAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "optimized" | "belle">(
    "current",
  );
  const [selectedColor, setSelectedColor] = useState<FinalPaletteColor | null>(
    null,
  );
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [finalReviewText, setFinalReviewText] = useState<string | null>(null);
  const [showPaletteCard, setShowPaletteCard] = useState(false);
  const [isSketch, setIsSketch] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("Nhẹ nhàng (Pastel)");
  const [paintType, setPaintType] = useState("Poster Color");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (activeTab === "belle" && chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatting, activeTab]);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Hãy chọn một file ảnh.");
      return;
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setActiveTab("current");
    setSelectedColor(null);
    setChatHistory([]);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        try {
          const base64Data = result.split(",")[1];
          setBase64Image(base64Data);
          setMimeType(compressed.type);
          const analysis = await analyzeArt(
            base64Data,
            compressed.type,
            isSketch,
            selectedStyle,
            paintType,
            signal,
          );
          setAnalysisResult(analysis);
          if (isSketch && analysis.determined_mood) {
            setChatHistory([
              {
                role: "model",
                text: `Chào Tuấn! Bức phác thảo này gợi cảm giác ${analysis.determined_mood}. Belle đã chọn bảng màu phong cách ${analysis.suggested_style}. Bạn thấy sao?`,
              },
            ]);
          }
          if (analysis.suggestions?.final_palette?.length > 0)
            setSelectedColor(analysis.suggestions.final_palette[0]);
          else if (analysis.current_colors?.length > 0)
            setSelectedColor(analysis.current_colors[0] as any);
        } catch (err: any) {
          if (err.name !== "AbortError") {
            console.error(err);
            setError("Phân tích thất bại. Vui lòng thử lại.");
          }
        } finally {
          if (!signal.aborted) setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
      setError("Không thể xử lý ảnh.");
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const resetApp = () => {
    abortControllerRef.current?.abort();
    setImageSrc(null);
    setBase64Image(null);
    setMimeType(null);
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(false);
    setActiveTab("current");
    setSelectedColor(null);
    setChatHistory([]);
    setFinalReviewText(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getTextColor = (hex: string) => {
    try {
      return chroma.contrast(hex, "white") > 4.5 ? "#ffffff" : "#000000";
    } catch {
      return "#000000";
    }
  };

  const handleSendMessage = async (text: string, isFinalReview = false) => {
    if (
      (!text.trim() && !isFinalReview) ||
      !base64Image ||
      !mimeType ||
      !analysisResult
    )
      return;
    const userMessage = isFinalReview
      ? "Tôi đã hoàn thành bức tranh này. Hãy cho tôi nhận xét cuối cùng nhé."
      : text.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsChatting(true);
    try {
      const prompt = isFinalReview
        ? "Bức tranh này đã hoàn thành. Với tư cách là Belle từ Belleza Lab, hãy đưa ra một lời nhận xét chuyên sâu, cấu trúc: Emotional Impact, Technical Skill, Overall Harmony, Exhibition Suggestion."
        : userMessage;
      const responseText = await chatWithBelle(
        prompt,
        chatHistory,
        base64Image,
        mimeType,
        analysisResult,
      );
      setChatHistory((prev) => [
        ...prev,
        { role: "model", text: responseText },
      ]);
      if (isFinalReview) {
        setFinalReviewText(responseText);
        setShowPaletteCard(true);
      }
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          text: "Xin lỗi, Belle đang gặp sự cố. Bạn thử lại sau nhé!",
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  // ─── Border & glass helpers based on theme ─────────────────
  const borderCol = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const borderSubtle = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const glassBg = isDark ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.60)";
  const accentCol = isDark ? "#D4AF37" : "#B8860B";
  const dragBorderCol = isDark ? "#D4AF37" : "#B8860B";
  const dragBg = isDark ? "rgba(212,175,55,0.05)" : "rgba(184,134,11,0.04)";
  const dragGlow = isDark
    ? "0 0 40px rgba(212,175,55,0.15)"
    : "0 0 30px rgba(184,134,11,0.08)";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuroraBackground />
      <ThemeToggle mode={themeMode} onToggle={toggleTheme} />

      {/* Image blur overlay */}
      <AnimatePresence>
        {imageSrc && (
          <motion.div
            key="img-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(120px) saturate(0.35)",
              opacity: isDark ? 0.06 : 0.04,
            }}
          />
        )}
      </AnimatePresence>

      {/* Layout */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* ===== LEFT: Main ===== */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, md: 6 },
            overflowY: "auto",
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 680,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              style={{ textAlign: "center", marginBottom: 48 }}
            >
              <Typography
                variant="h1"
                className="animated-logo"
                sx={{
                  fontSize: { xs: "2.8rem", md: "4.2rem" },
                  mb: 1,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                Belleza Lab
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  maxWidth: 400,
                  mx: "auto",
                  lineHeight: 1.7,
                  fontSize: "0.92rem",
                  letterSpacing: "0.01em",
                }}
              >
                Mã hóa nghệ thuật · Giải phóng bảng màu
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--accent)",
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: "italic",
                  mt: 0.5,
                  opacity: 0.6,
                  fontSize: "0.85rem",
                }}
              >
                Nàng thơ ảo Belle luôn bên bạn
              </Typography>
            </motion.div>

            <AnimatePresence mode="wait">
              {!imageSrc ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: "100%" }}
                >
                  {/* Sketch Options */}
                  <GlassCard
                    sx={{
                      p: 2.5,
                      mb: 3,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      component="label"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSketch}
                        onChange={(e) => setIsSketch(e.target.checked)}
                        style={{ display: "none" }}
                      />
                      <Box
                        sx={{
                          width: 38,
                          height: 20,
                          borderRadius: 3,
                          position: "relative",
                          background: isSketch
                            ? "var(--accent)"
                            : "var(--chip-bg)",
                          border: `1px solid ${isSketch ? "var(--accent)" : "var(--chip-border)"}`,
                          transition: "all 0.3s",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 2,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: isDark
                              ? "#fff"
                              : isSketch
                                ? "#fff"
                                : "#9CA3AF",
                            left: isSketch ? "calc(100% - 16px)" : 2,
                            transition:
                              "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: isSketch ? "var(--accent)" : "text.secondary",
                          transition: "color 0.2s",
                          fontSize: "0.85rem",
                        }}
                      >
                        Tranh phác thảo
                      </Typography>
                    </Box>
                    <AnimatePresence>
                      {isSketch && (
                        <motion.div
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }}
                        >
                          <Box sx={{ display: "flex", gap: 1.5 }}>
                            {[
                              {
                                val: selectedStyle,
                                setter: setSelectedStyle,
                                opts: [
                                  ["Nhẹ nhàng (Pastel)", "Pastel"],
                                  ["Vui tươi (Vibrant)", "Vui tươi"],
                                  ["U buồn (Melancholy)", "U buồn"],
                                  ["Cổ điển (Vintage)", "Cổ điển"],
                                  ["Hiện đại (Modern)", "Hiện đại"],
                                ],
                              },
                              {
                                val: paintType,
                                setter: setPaintType,
                                opts: [
                                  ["Poster Color", "Poster Color"],
                                  ["Watercolor", "Watercolor"],
                                  ["Acrylic", "Acrylic"],
                                  ["Oil Paint", "Oil Paint"],
                                  ["Digital Art", "Digital Art"],
                                ],
                              },
                            ].map((sel, idx) => (
                              <Box
                                key={idx}
                                component="select"
                                value={sel.val}
                                onChange={(e: any) =>
                                  sel.setter(e.target.value)
                                }
                                sx={{
                                  background: "var(--select-bg)",
                                  border: "1px solid var(--select-border)",
                                  borderRadius: 2,
                                  px: 1.5,
                                  py: 0.8,
                                  color: "var(--text-primary)",
                                  fontSize: "0.78rem",
                                  cursor: "pointer",
                                  outline: "none",
                                  fontFamily: '"DM Sans", sans-serif',
                                }}
                              >
                                {sel.opts.map(([v, l]) => (
                                  <option key={v} value={v}>
                                    {l}
                                  </option>
                                ))}
                              </Box>
                            ))}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>

                  {/* Upload Zone */}
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: 20,
                      border: `2px dashed ${isDragging ? dragBorderCol : borderCol}`,
                      background: isDragging ? dragBg : "var(--glass-bg)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: isDragging ? dragGlow : "none",
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />

                    {/* Decorative corners */}
                    {[
                      { top: 14, left: 14, bt: true, bl: true },
                      { top: 14, right: 14, bt: true, br: true },
                      { bottom: 14, left: 14, bb: true, bl: true },
                      { bottom: 14, right: 14, bb: true, br: true },
                    ].map((c: any, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: "absolute",
                          width: 18,
                          height: 18,
                          ...(c.top !== undefined && { top: c.top }),
                          ...(c.bottom !== undefined && { bottom: c.bottom }),
                          ...(c.left !== undefined && { left: c.left }),
                          ...(c.right !== undefined && { right: c.right }),
                          borderTop: c.bt
                            ? `2px solid ${isDragging ? dragBorderCol : borderCol}`
                            : "none",
                          borderBottom: c.bb
                            ? `2px solid ${isDragging ? dragBorderCol : borderCol}`
                            : "none",
                          borderLeft: c.bl
                            ? `2px solid ${isDragging ? dragBorderCol : borderCol}`
                            : "none",
                          borderRight: c.br
                            ? `2px solid ${isDragging ? dragBorderCol : borderCol}`
                            : "none",
                          transition: "border-color 0.3s",
                        }}
                      />
                    ))}

                    <motion.div
                      animate={isDragging ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          background: "var(--accent-subtle)",
                          border: `1px solid ${isDragging ? accentCol : borderCol}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                          color: isDragging
                            ? accentCol
                            : "var(--text-secondary)",
                          transition: "all 0.3s",
                        }}
                      >
                        <UploadCloud size={32} />
                      </Box>
                    </motion.div>
                    <Typography
                      variant="h6"
                      sx={{
                        color: isDragging ? accentCol : "text.primary",
                        mb: 0.5,
                        fontWeight: 600,
                        transition: "color 0.3s",
                        fontSize: "1.1rem",
                      }}
                    >
                      Phóng tác phẩm của bạn
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        fontSize: "0.7rem",
                      }}
                    >
                      Kéo thả hoặc nhấn để chọn ảnh
                    </Typography>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ width: "100%" }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: isDark
                        ? "0 24px 60px -12px rgba(0,0,0,0.6)"
                        : "0 16px 48px -12px rgba(0,0,0,0.12)",
                      border: `1px solid ${borderCol}`,
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Uploaded artwork"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "70vh",
                        objectFit: "contain",
                        display: "block",
                        background: "var(--img-preview-bg)",
                      }}
                    />
                    <AnimatePresence>
                      {isAnalyzing && <ArtLoader />}
                    </AnimatePresence>
                  </Box>
                  {!isAnalyzing && (
                    <Zoom in>
                      <Box
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <GhostButton
                          onClick={resetApp}
                          size="large"
                          startIcon={
                            <motion.div
                              whileHover={{ rotate: 180 }}
                              transition={{ duration: 0.4 }}
                            >
                              <RefreshCw size={18} />
                            </motion.div>
                          }
                        >
                          Phân tích tác phẩm khác
                        </GhostButton>
                      </Box>
                    </Zoom>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ marginTop: 16, width: "100%" }}
                >
                  <Box
                    sx={{
                      p: 2,
                      background: "var(--error-bg)",
                      border: "1px solid var(--error-border)",
                      borderRadius: 2,
                      color: "var(--error-text)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <AlertTriangle size={16} />
                    <Typography variant="body2">{error}</Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        {/* ===== RIGHT: Sidebar ===== */}
        <AnimatePresence>
          {(isAnalyzing || analysisResult) && (
            <motion.aside
              key="sidebar"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
              style={{
                width: "100%",
                maxWidth: 460,
                height: "100vh",
                overflowY: "auto",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                background: "var(--sidebar-bg)",
                backdropFilter: "blur(40px)",
                borderLeft: `1px solid ${borderCol}`,
                boxShadow: `-16px 0 48px var(--sidebar-shadow)`,
                transition: "background 0.3s, border-color 0.3s",
              }}
            >
              <Box
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: "var(--accent-subtle)",
                        border: `1px solid ${accentCol}22`,
                        display: "flex",
                      }}
                    >
                      <ImageIcon size={20} style={{ color: accentCol }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, fontSize: "1.35rem" }}
                    >
                      Khai phá Nghệ thuật
                    </Typography>
                  </Box>
                </motion.div>

                {isAnalyzing ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {[72, 90, 90, 0].map((h, i) =>
                      h ? (
                        <Box
                          key={i}
                          className="shimmer"
                          sx={{ height: h, borderRadius: 2 }}
                        />
                      ) : (
                        <Box
                          key={i}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 1.5,
                          }}
                        >
                          {[0, 1, 2, 3].map((j) => (
                            <Box
                              key={j}
                              className="shimmer"
                              sx={{ height: 120, borderRadius: 2 }}
                            />
                          ))}
                        </Box>
                      ),
                    )}
                  </Box>
                ) : analysisResult ? (
                  <Box
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    {/* Tabs */}
                    <Box
                      sx={{
                        mb: 3,
                        background: "var(--chip-bg)",
                        borderRadius: 2.5,
                        p: 0.5,
                        border: `1px solid ${borderSubtle}`,
                      }}
                    >
                      <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        variant="fullWidth"
                        slotProps={
                          { indicator: { style: { display: "none" } } } as any
                        }
                        sx={{
                          minHeight: 38,
                          "& .MuiTab-root": {
                            minHeight: 42,
                            borderRadius: 2,
                            color: "text.secondary",
                            transition: "all 0.25s",
                            fontSize: "1.05rem",
                          },
                          "& .Mui-selected": {
                            color: "#fff !important",
                            background: `var(--accent) !important`,
                            fontWeight: "700 !important",
                          },
                        }}
                      >
                        <Tab
                          value="current"
                          label={isSketch ? "Bản vẽ" : "Hiện tại"}
                        />
                        {!isSketch && (
                          <Tab
                            value="optimized"
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Wand2 size={13} />
                                <span>Tối ưu</span>
                              </Box>
                            }
                          />
                        )}
                        <Tab
                          value="belle"
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <MessageCircle size={13} />
                              <span>Belle</span>
                            </Box>
                          }
                        />
                      </Tabs>
                    </Box>

                    <Box sx={{ flex: 1, position: "relative" }}>
                      <AnimatePresence mode="wait">
                        {/* Current Tab */}
                        {activeTab === "current" && (
                          <motion.div
                            key="current"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              overflowY: "auto",
                              paddingBottom: 32,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: accentCol,
                                    letterSpacing: "0.15em",
                                    fontSize: "0.6rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    mb: 1.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  <Droplet size={12} />{" "}
                                  {isSketch
                                    ? "Chất liệu đề xuất"
                                    : "Chất liệu dự đoán"}
                                </Typography>
                                <GlassCard
                                  sx={{
                                    p: 3,
                                    position: "relative",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 8,
                                      right: 8,
                                      opacity: 0.05,
                                    }}
                                  >
                                    <Droplet size={56} />
                                  </Box>
                                  <Typography
                                    variant="h6"
                                    sx={{ mb: 1, fontSize: "1.3rem" }}
                                  >
                                    {analysisResult.medium}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      fontStyle: "italic",
                                      lineHeight: 1.7,
                                      fontSize: "1.15rem",
                                    }}
                                  >
                                    {analysisResult.mediumDescription}
                                  </Typography>
                                </GlassCard>
                              </Box>
                              {isSketch && analysisResult.placement_guide && (
                                <Box>
                                  <Typography
                                    variant="overline"
                                    sx={{
                                      color: accentCol,
                                      letterSpacing: "0.15em",
                                      fontSize: "0.6rem",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.8,
                                      mb: 1.5,
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Info size={12} /> Hướng dẫn tô màu
                                  </Typography>
                                  <GlassCard sx={{ p: 3 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "text.secondary",
                                        lineHeight: 1.8,
                                        fontFamily:
                                          '"Cormorant Garamond", serif',
                                        fontStyle: "italic",
                                        whiteSpace: "pre-wrap",
                                        fontSize: "1.2rem",
                                      }}
                                    >
                                      {analysisResult.placement_guide}
                                    </Typography>
                                  </GlassCard>
                                </Box>
                              )}
                              <Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: accentCol,
                                    letterSpacing: "0.15em",
                                    fontSize: "0.6rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    mb: 1.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  <Palette size={12} />{" "}
                                  {isSketch
                                    ? "Bảng màu đề xuất"
                                    : "Bảng màu hiện tại"}
                                </Typography>
                                <motion.div
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="show"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr",
                                    gap: 10,
                                  }}
                                >
                                  {analysisResult.current_colors.map(
                                    (color, i) => {
                                      const unfit =
                                        analysisResult.issue?.unfit_colors?.find(
                                          (u) =>
                                            u.hex.toLowerCase() ===
                                            color.hex.toLowerCase(),
                                        );
                                      return (
                                        <ColorFlipCard
                                          key={i}
                                          color={color}
                                          unfitInfo={unfit}
                                        />
                                      );
                                    },
                                  )}
                                </motion.div>
                              </Box>
                            </Box>
                          </motion.div>
                        )}

                        {/* Optimized Tab */}
                        {!isSketch && activeTab === "optimized" && (
                          <motion.div
                            key="optimized"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              overflowY: "auto",
                              paddingBottom: 32,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#6366f1",
                                    letterSpacing: "0.15em",
                                    fontSize: "0.65rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    mb: 1.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  <Sparkles size={12} /> Lời khuyên từ Belle
                                </Typography>
                                <GlassCard sx={{ p: 3 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      lineHeight: 1.8,
                                      fontFamily: '"Cormorant Garamond", serif',
                                      fontStyle: "italic",
                                      mb: 2.5,
                                      fontSize: "1.2rem",
                                    }}
                                  >
                                    {analysisResult.issue?.critique}
                                  </Typography>
                                  <Typography
                                    variant="overline"
                                    sx={{
                                      fontSize: "0.6rem",
                                      letterSpacing: "0.12em",
                                      color: "var(--text-muted)",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      mb: 1.5,
                                    }}
                                  >
                                    <CheckCircle size={11} /> Thay thế đề xuất
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                    }}
                                  >
                                    {analysisResult.suggestions?.replacement_colors?.map(
                                      (color, i) => (
                                        <motion.div
                                          key={i}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.1 }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 2,
                                            }}
                                          >
                                            <motion.div
                                              whileHover={{
                                                scale: 1.12,
                                                y: -2,
                                              }}
                                              transition={{
                                                type: "spring",
                                                stiffness: 300,
                                              }}
                                            >
                                              <Box
                                                sx={{
                                                  width: 40,
                                                  height: 40,
                                                  borderRadius: 2,
                                                  bgcolor: color.hex,
                                                  border: `1px solid ${borderCol}`,
                                                  boxShadow: `0 3px 12px ${color.hex}33`,
                                                  flexShrink: 0,
                                                }}
                                              />
                                            </motion.div>
                                            <Box sx={{ flex: 1 }}>
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 1,
                                                }}
                                              >
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontWeight: 700,
                                                    fontSize: "0.95rem",
                                                  }}
                                                >
                                                  {color.name}
                                                </Typography>
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    fontFamily: "monospace",
                                                    color: "text.secondary",
                                                    fontSize: "0.7rem",
                                                  }}
                                                >
                                                  {color.hex}
                                                </Typography>
                                              </Box>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "text.secondary",
                                                  fontStyle: "italic",
                                                  fontSize: "0.82rem",
                                                }}
                                              >
                                                {color.why}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </motion.div>
                                      ),
                                    )}
                                  </Box>
                                </GlassCard>
                              </Box>
                              <Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#6366f1",
                                    letterSpacing: "0.15em",
                                    fontSize: "0.6rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    mb: 1.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  <Palette size={12} /> Bảng màu Hoàn mỹ
                                </Typography>
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr",
                                    gap: 1.5,
                                    mb: 2,
                                  }}
                                >
                                  {analysisResult.suggestions.final_palette.map(
                                    (color, i) => {
                                      const isSelected =
                                        selectedColor?.hex === color.hex;
                                      const tc = getTextColor(color.hex);
                                      return (
                                        <motion.div
                                          key={i}
                                          whileHover={{ scale: 1.04, y: -4 }}
                                          whileTap={{ scale: 0.96 }}
                                          onClick={() =>
                                            setSelectedColor(color)
                                          }
                                          style={{
                                            borderRadius: 14,
                                            padding: "14px",
                                            minHeight: 140,
                                            cursor: "pointer",
                                            backgroundColor: color.hex,
                                            position: "relative",
                                            overflow: "hidden",
                                            boxShadow: isSelected
                                              ? `0 0 0 2px ${tc === "#ffffff" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"}, 0 0 0 4px #6366f1`
                                              : `0 6px 20px ${color.hex}33`,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            style={{
                                              color: tc,
                                              opacity: 0.6,
                                              fontWeight: 700,
                                              textTransform: "uppercase",
                                              letterSpacing: "0.1em",
                                              fontSize: "0.85rem",
                                              display: "block",
                                            }}
                                          >
                                            {color.role}
                                          </Typography>
                                          <Box
                                            style={{
                                              position: "absolute",
                                              bottom: 10,
                                              left: 10,
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              style={{
                                                color: tc,
                                                fontWeight: 700,
                                                fontSize: "1.15rem",
                                              }}
                                            >
                                              {color.name}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              style={{
                                                color: tc,
                                                opacity: 0.6,
                                                fontFamily: "monospace",
                                                fontSize: "0.9rem",
                                              }}
                                            >
                                              {color.hex}
                                            </Typography>
                                          </Box>
                                          {isSelected && (
                                            <Box
                                              style={{
                                                position: "absolute",
                                                top: 6,
                                                right: 6,
                                                background:
                                                  "var(--card-badge-bg)",
                                                borderRadius: "50%",
                                                padding: 2,
                                                display: "flex",
                                              }}
                                            >
                                              <CheckCircle
                                                size={13}
                                                color={tc}
                                              />
                                            </Box>
                                          )}
                                        </motion.div>
                                      );
                                    },
                                  )}
                                </Box>
                                <AnimatePresence mode="wait">
                                  {selectedColor && (
                                    <motion.div
                                      key={selectedColor.hex}
                                      initial={{ opacity: 0, x: 16 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -16 }}
                                      transition={{ duration: 0.22 }}
                                    >
                                      <GlassCard
                                        sx={{
                                          p: 3,
                                          position: "relative",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: 3,
                                            height: "100%",
                                            bgcolor: selectedColor.hex,
                                          }}
                                        />
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            mb: 1.5,
                                            pl: 1,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 20,
                                              height: 20,
                                              borderRadius: "50%",
                                              bgcolor: selectedColor.hex,
                                              border: `2px solid ${borderCol}`,
                                              flexShrink: 0,
                                            }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: 700,
                                              textTransform: "uppercase",
                                              letterSpacing: "0.06em",
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            Công thức: {selectedColor.name}
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "text.secondary",
                                            lineHeight: 1.8,
                                            fontFamily:
                                              '"Cormorant Garamond", serif',
                                            fontStyle: "italic",
                                            pl: 1,
                                            fontSize: "1.2rem",
                                          }}
                                        >
                                          {selectedColor.mixingGuide}
                                        </Typography>
                                      </GlassCard>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Box>
                            </Box>
                          </motion.div>
                        )}

                        {/* Belle Chat */}
                        {activeTab === "belle" && (
                          <motion.div
                            key="belle"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 16,
                              border: `1px solid ${borderCol}`,
                              overflow: "hidden",
                              background: "var(--glass-bg)",
                            }}
                          >
                            <Box
                              sx={{
                                p: 2.5,
                                borderBottom: `1px solid ${borderSubtle}`,
                                background: "var(--chip-bg)",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Box sx={{ position: "relative" }}>
                                  <Avatar
                                    sx={{
                                      width: 44,
                                      height: 44,
                                      borderRadius: 2,
                                      background: `linear-gradient(135deg, var(--accent), #8B6914)`,
                                      fontSize: "1.2rem",
                                      fontFamily: '"Cormorant Garamond", serif',
                                      fontWeight: 700,
                                      boxShadow:
                                        "0 3px 12px var(--accent-glow)",
                                    }}
                                  >
                                    B
                                  </Avatar>
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      bottom: -2,
                                      right: -2,
                                      width: 11,
                                      height: 11,
                                      background: "#34d399",
                                      borderRadius: "50%",
                                      border: "2px solid var(--bg-primary)",
                                    }}
                                  />
                                </Box>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      fontWeight: 700,
                                      lineHeight: 1.2,
                                      fontSize: "1.05rem",
                                    }}
                                  >
                                    Belle
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: accentCol,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.12em",
                                      fontSize: "0.55rem",
                                      fontWeight: 600,
                                      opacity: 0.7,
                                    }}
                                  >
                                    Nàng thơ Nghệ thuật
                                  </Typography>
                                </Box>
                              </Box>
                              <Sparkles
                                size={15}
                                style={{ color: "var(--text-muted)" }}
                              />
                            </Box>

                            <Box
                              sx={{
                                flex: 1,
                                overflowY: "auto",
                                p: 2.5,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                              >
                                <Box
                                  sx={{
                                    maxWidth: "88%",
                                    p: 2,
                                    background: "var(--bg-surface-alpha)",
                                    border: `1px solid ${borderCol}`,
                                    borderRadius: "18px 18px 18px 4px",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      lineHeight: 1.7,
                                      fontFamily: '"Cormorant Garamond", serif',
                                      fontStyle: "italic",
                                      fontSize: "1.2rem",
                                    }}
                                    className="typewriter-cursor"
                                  >
                                    Chào Tuấn! Mình là Belle, nàng thơ ảo của
                                    Belleza Lab. Có điều gì bạn muốn khám phá
                                    thêm không?
                                  </Typography>
                                </Box>
                              </motion.div>
                              {chatHistory.map((msg, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  style={{
                                    display: "flex",
                                    justifyContent:
                                      msg.role === "user"
                                        ? "flex-end"
                                        : "flex-start",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      maxWidth: "88%",
                                      p: 2,
                                      ...(msg.role === "user"
                                        ? {
                                            background: "var(--user-bubble)",
                                            color: "#fff",
                                            borderRadius: "18px 18px 4px 18px",
                                            boxShadow:
                                              "0 3px 12px var(--user-bubble-shadow)",
                                          }
                                        : {
                                            background:
                                              "var(--bg-surface-alpha)",
                                            border: `1px solid ${borderCol}`,
                                            borderRadius: "18px 18px 18px 4px",
                                          }),
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        lineHeight: 1.7,
                                        fontFamily:
                                          msg.role === "model"
                                            ? '"Cormorant Garamond", serif'
                                            : "inherit",
                                        fontStyle:
                                          msg.role === "model"
                                            ? "italic"
                                            : "normal",
                                        whiteSpace: "pre-wrap",
                                        fontSize: "1.2rem",
                                      }}
                                    >
                                      {msg.text}
                                    </Typography>
                                  </Box>
                                </motion.div>
                              ))}
                              {isChatting && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <Box
                                    sx={{
                                      p: 2,
                                      background: "var(--bg-surface-alpha)",
                                      border: `1px solid ${borderCol}`,
                                      borderRadius: "18px 18px 18px 4px",
                                      display: "inline-flex",
                                      gap: 0.6,
                                      alignItems: "center",
                                    }}
                                  >
                                    {[0, 1, 2].map((i) => (
                                      <motion.div
                                        key={i}
                                        animate={{
                                          scale: [1, 1.5, 1],
                                          opacity: [0.3, 1, 0.3],
                                        }}
                                        transition={{
                                          duration: 0.8,
                                          repeat: Infinity,
                                          delay: i * 0.15,
                                        }}
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
                              )}
                              <div ref={chatEndRef} />
                            </Box>

                            <Box
                              sx={{
                                p: 2.5,
                                borderTop: `1px solid ${borderSubtle}`,
                                background: "var(--chip-bg)",
                                flexShrink: 0,
                              }}
                            >
                              {chatHistory.length === 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.8,
                                    mb: 2,
                                  }}
                                >
                                  {[
                                    { t: "Bố cục đã ổn chưa?", i: "🎨" },
                                    { t: "Gợi ý cách vẽ mây.", i: "💡" },
                                    { t: "Hợp với không gian nào?", i: "🏠" },
                                  ].map((btn, i) => (
                                    <Chip
                                      key={i}
                                      label={`${btn.i} ${btn.t}`}
                                      size="small"
                                      onClick={() => handleSendMessage(btn.t)}
                                      sx={{
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        background: "var(--chip-bg)",
                                        border: `1px solid var(--chip-border)`,
                                        "&:hover": {
                                          borderColor: accentCol,
                                          color: accentCol,
                                        },
                                        py: 2.2,
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                  mb: 2,
                                }}
                              >
                                <AccentButton
                                  size="small"
                                  startIcon={<Award size={14} />}
                                  onClick={() => handleSendMessage("", true)}
                                  disabled={isChatting}
                                  sx={{ px: 2, py: 0.8, fontSize: "0.73rem" }}
                                >
                                  Final Review
                                </AccentButton>
                                {finalReviewText && (
                                  <GhostButton
                                    size="small"
                                    startIcon={<ImageIcon size={14} />}
                                    onClick={() => setShowPaletteCard(true)}
                                    sx={{ px: 2, py: 0.8, fontSize: "0.73rem" }}
                                  >
                                    Xem Thẻ Màu
                                  </GhostButton>
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  alignItems: "center",
                                }}
                              >
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    handleSendMessage(chatInput)
                                  }
                                  placeholder="Hỏi Belle về bức tranh..."
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2.5,
                                      background: "var(--glass-bg)",
                                      "& fieldset": { borderColor: borderCol },
                                      "&:hover fieldset": {
                                        borderColor: accentCol,
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: accentCol,
                                      },
                                      "& input": {
                                        color: "var(--text-primary)",
                                        fontSize: "0.82rem",
                                        fontFamily: '"DM Sans", sans-serif',
                                      },
                                    },
                                  }}
                                />
                                <motion.div
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.92 }}
                                >
                                  <IconButton
                                    onClick={() => handleSendMessage(chatInput)}
                                    disabled={!chatInput.trim() || isChatting}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      background: chatInput.trim()
                                        ? "var(--accent)"
                                        : "var(--chip-bg)",
                                      color: chatInput.trim()
                                        ? "#fff"
                                        : "text.secondary",
                                      transition: "all 0.2s",
                                      "&:hover": {
                                        background: "var(--accent-hover)",
                                      },
                                      "&:disabled": { opacity: 0.4 },
                                    }}
                                  >
                                    <Send size={17} />
                                  </IconButton>
                                </motion.div>
                              </Box>
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </motion.aside>
          )}
        </AnimatePresence>
      </Box>

      <AnimatePresence>
        {showPaletteCard && analysisResult && imageSrc && (
          <PaletteCard
            image={imageSrc}
            colors={analysisResult.current_colors}
            critique={finalReviewText || "Một tác phẩm tuyệt vời."}
            onClose={() => setShowPaletteCard(false)}
          />
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
