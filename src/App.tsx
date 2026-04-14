import React, { useState, useRef, useEffect } from 'react';
import {
  ThemeProvider, createTheme, CssBaseline,
  Box, Typography, Button, IconButton,
  Paper, Tabs, Tab, TextField, Avatar, Chip, Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import imageCompression from 'browser-image-compression';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';
import {
  UploadCloud, Image as ImageIcon, Palette, Droplet, RefreshCw,
  Sparkles, AlertTriangle, Wand2, CheckCircle, Info, MessageCircle,
  Send, Award, Download, X,
} from 'lucide-react';
import { analyzeArt, ArtAnalysisResult, FinalPaletteColor, chatWithBelle, ChatMessage } from './services/geminiService';

// ─── MUI DARK THEME ──────────────────────────────────────────
const bellezaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    secondary: { main: '#3b82f6' },
    background: { default: '#04040a', paper: 'rgba(14,14,22,0.8)' },
    text: { primary: '#f0f0f5', secondary: '#7a7a8c' },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
});

// ─── STYLED COMPONENTS ───────────────────────────────────────
const GlassCard = styled(Paper)(() => ({
  background: 'rgba(14,14,22,0.75)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}));

const GoldButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
  color: '#000',
  fontWeight: 700,
  borderRadius: 50,
  '&:hover': {
    background: 'linear-gradient(135deg, #fbbf24, #fb923c)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
  },
  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
}));

const GhostButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: theme.palette.text.secondary,
  borderRadius: 50,
  '&:hover': {
    background: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(245,158,11,0.4)',
    color: '#f59e0b',
  },
  transition: 'all 0.2s ease',
}));

// ─── ANIMATION VARIANTS ──────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any } },
};

// ─── AURORA BACKGROUND ───────────────────────────────────────
const AuroraBackground = () => (
  <div className="aurora-bg dot-grid">
    <div className="aurora-orb aurora-orb-1" />
    <div className="aurora-orb aurora-orb-2" />
    <div className="aurora-orb aurora-orb-3" />
    <div className="aurora-orb aurora-orb-4" />
  </div>
);

// ─── ART LOADER ──────────────────────────────────────────────
const ArtLoader = () => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{
      position: 'absolute', inset: 0,
      background: 'rgba(4,4,10,0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10,
    }}
  >
    <Box sx={{ position: 'relative', mb: 4 }}>
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360], borderRadius: ['30% 70% 70% 30%', '50% 50%', '30% 70% 70% 30%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#f59e0b,#3b82f6,#8b5cf6)', filter: 'blur(8px)', opacity: 0.6 }}
      />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles size={28} color="#f59e0b" />
        </motion.div>
      </Box>
    </Box>
    <Typography sx={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', color: 'rgba(240,240,245,0.85)', fontSize: '1.1rem' }}>
      Belleza Lab đang cảm thụ bức tranh...
    </Typography>
    <Box sx={{ mt: 2, display: 'flex', gap: 0.8 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}
        />
      ))}
    </Box>
  </motion.div>
);

// ─── COLOR FLIP CARD ─────────────────────────────────────────
const ColorFlipCard: React.FC<{ color: any; unfitInfo: any }> = ({ color, unfitInfo }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-50, 50], [8, -8]);
  const rotY = useTransform(mx, [-50, 50], [-8, 8]);

  return (
    <motion.div
      variants={itemVariants}
      style={{ perspective: 1000, cursor: 'pointer', aspectRatio: '3/4', position: 'relative' }}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseMove={e => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      <motion.div
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Front */}
        <Box className="backface-hidden" sx={{
          position: 'absolute', inset: 0,
          background: 'rgba(14,14,22,0.75)', border: `1px solid ${unfitInfo ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.07)'}`,
          backdropFilter: 'blur(20px)', borderRadius: 3,
          p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          '&:hover': { borderColor: 'rgba(245,158,11,0.3)' }, transition: 'border-color 0.2s',
        }}>
          <Box sx={{ position: 'relative' }}>
            <motion.div
              whileHover={{ scale: 1.12, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                backgroundColor: color.hex,
                border: '2px solid rgba(255,255,255,0.15)',
                boxShadow: `0 8px 24px ${color.hex}55`,
              }}
            />
            {unfitInfo && (
              <Box sx={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', borderRadius: '50%', p: 0.4, display: 'flex' }}>
                <AlertTriangle size={12} color="white" />
              </Box>
            )}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', mb: 0.5 }}>{color.name}</Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', background: 'rgba(255,255,255,0.05)', px: 1, py: 0.3, borderRadius: 1, display: 'block' }}>
              {color.hex}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.6rem', position: 'absolute', bottom: 12 }}>
            Click to flip
          </Typography>
        </Box>

        {/* Back */}
        <Box className="backface-hidden" sx={{
          position: 'absolute', inset: 0,
          background: 'rgba(8,8,16,0.95)', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)', borderRadius: 3, p: 2.5,
          transform: 'rotateY(180deg)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: color.hex, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>{color.name}</Typography>
          </Box>
          {unfitInfo && (
            <Box sx={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 2, p: 1.2, mb: 1.5, display: 'flex', gap: 1 }}>
              <AlertTriangle size={12} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <Typography variant="caption" sx={{ color: '#fca5a5', fontSize: '0.65rem' }}>{unfitInfo.reason}</Typography>
            </Box>
          )}
          <Typography variant="caption" sx={{ color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.58rem', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Droplet size={10} /> Mixing Guide
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.7, fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '0.72rem', overflow: 'auto', flex: 1 }}>
            {color.mixingGuide}
          </Typography>
        </Box>
      </motion.div>
    </motion.div>
  );
};

// ─── PALETTE CARD (Downloadable) ─────────────────────────────
const PaletteCard = ({ image, colors, critique, onClose }: { image: string; colors: any[]; critique: string; onClose: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCard = () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    toPng(cardRef.current, { cacheBust: true })
      .then(url => { const a = document.createElement('a'); a.download = 'Belleza-Lab-Palette.png'; a.href = url; a.click(); })
      .finally(() => setIsDownloading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: 16 }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
      >
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: -48, right: 0, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', '&:hover': { background: 'rgba(255,255,255,0.15)' } }}>
          <X size={20} />
        </IconButton>
        <Box ref={cardRef} sx={{ width: 420, p: 4, background: '#0c0c14', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f59e0b,#f97316,#f59e0b)' }} />
          <Typography variant="h6" sx={{ textAlign: 'center', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#f59e0b', fontFamily: '"Playfair Display",serif', mb: 3, fontWeight: 700 }}>
            Belleza Lab
          </Typography>
          <Box sx={{ position: 'relative', mb: 3, borderRadius: 1, overflow: 'hidden' }}>
            <img src={image} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} alt="Artwork" crossOrigin="anonymous" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, px: 1 }}>
            {colors.slice(0, 5).map((c, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: c.hex, border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 4px 16px ${c.hex}44` }} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{c.hex}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', pt: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: '0.78rem', px: 2 }}>
              "{critique}"
            </Typography>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#f59e0b' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.55rem' }}>
              Analyzed by Belle · Art Intelligence
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#f59e0b' }} />
          </Box>
        </Box>
        <GoldButton onClick={downloadCard} disabled={isDownloading} startIcon={<Download size={16} />} sx={{ mt: 3 }}>
          {isDownloading ? 'Đang tải...' : 'Tải Thẻ Màu Cao Cấp'}
        </GoldButton>
      </motion.div>
    </motion.div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ArtAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'optimized' | 'belle'>('current');
  const [selectedColor, setSelectedColor] = useState<FinalPaletteColor | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [finalReviewText, setFinalReviewText] = useState<string | null>(null);
  const [showPaletteCard, setShowPaletteCard] = useState(false);
  const [isSketch, setIsSketch] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Nhẹ nhàng (Pastel)');
  const [paintType, setPaintType] = useState('Poster Color');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { abortControllerRef.current?.abort(); }, []);
  useEffect(() => {
    if (activeTab === 'belle' && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting, activeTab]);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    setError(null); setIsAnalyzing(true); setAnalysisResult(null);
    setActiveTab('current'); setSelectedColor(null); setChatHistory([]);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        try {
          const base64Data = result.split(',')[1];
          setBase64Image(base64Data); setMimeType(compressed.type);
          const analysis = await analyzeArt(base64Data, compressed.type, isSketch, selectedStyle, paintType, signal);
          setAnalysisResult(analysis);
          if (isSketch && analysis.determined_mood) {
            setChatHistory([{ role: 'model', text: `Chào Tuấn! Bức phác thảo này của bạn gợi cảm giác ${analysis.determined_mood}. Belle đã chọn một bảng màu phong cách ${analysis.suggested_style}. Bạn thấy sao?` }]);
          }
          if (analysis.suggestions?.final_palette?.length > 0) setSelectedColor(analysis.suggestions.final_palette[0]);
          else if (analysis.current_colors?.length > 0) setSelectedColor(analysis.current_colors[0] as any);
        } catch (err: any) {
          if (err.name !== 'AbortError') { console.error(err); setError('Phân tích thất bại. Vui lòng thử lại.'); }
        } finally { if (!signal.aborted) setIsAnalyzing(false); }
      };
      reader.readAsDataURL(compressed);
    } catch (err) { console.error(err); setError('Không thể xử lý ảnh.'); setIsAnalyzing(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) processFile(e.target.files[0]); };

  const resetApp = () => {
    abortControllerRef.current?.abort();
    setImageSrc(null); setBase64Image(null); setMimeType(null); setAnalysisResult(null);
    setError(null); setIsAnalyzing(false); setActiveTab('current');
    setSelectedColor(null); setChatHistory([]); setFinalReviewText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getTextColor = (hex: string) => { try { return chroma.contrast(hex, 'white') > 4.5 ? '#ffffff' : '#000000'; } catch { return '#000000'; } };

  const handleSendMessage = async (text: string, isFinalReview = false) => {
    if ((!text.trim() && !isFinalReview) || !base64Image || !mimeType || !analysisResult) return;
    const userMessage = isFinalReview ? 'Tôi đã hoàn thành bức tranh này. Hãy cho tôi nhận xét cuối cùng nhé.' : text.trim();
    setChatInput(''); setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]); setIsChatting(true);
    try {
      const prompt = isFinalReview
        ? 'Bức tranh này đã hoàn thành. Với tư cách là Belle từ Belleza Lab, hãy đưa ra một lời nhận xét chuyên sâu, đầy cảm hứng và tinh tế về tác phẩm này. Cấu trúc nhận xét: Emotional Impact, Technical Skill, Overall Harmony, Exhibition Suggestion.'
        : userMessage;
      const responseText = await chatWithBelle(prompt, chatHistory, base64Image, mimeType, analysisResult);
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
      if (isFinalReview) { setFinalReviewText(responseText); setShowPaletteCard(true); }
    } catch (err) {
      console.error(err); setChatHistory(prev => [...prev, { role: 'model', text: 'Xin lỗi Tuấn, Belle đang gặp chút sự cố. Bạn thử lại sau nhé!' }]);
    } finally { setIsChatting(false); }
  };

  return (
    <ThemeProvider theme={bellezaTheme}>
      <CssBaseline />
      <AuroraBackground />

      {/* Image blur overlay */}
      <AnimatePresence>
        {imageSrc && (
          <motion.div key="img-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(120px) saturate(0.4)', opacity: 0.07 }}
          />
        )}
      </AnimatePresence>

      {/* Layout */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100vh', overflow: 'hidden' }}>

        {/* ===== LEFT: Main Area ===== */}
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 }, overflowY: 'auto', height: '100%' }}>
          <Box sx={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', marginBottom: 48 }}>
              <Typography variant="h1" className="animated-logo" sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, mb: 1.5, lineHeight: 1 }}>
                Belleza Lab
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto', lineHeight: 1.8 }}>
                Mã hóa nghệ thuật · Giải phóng bảng màu
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(245,158,11,0.45)', fontFamily: '"Playfair Display",serif', fontStyle: 'italic', mt: 0.5 }}>
                Nàng thơ ảo Belle luôn bên bạn
              </Typography>
            </motion.div>

            <AnimatePresence mode="wait">
              {!imageSrc ? (
                <motion.div key="upload" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.4 }} style={{ width: '100%' }}>

                  {/* Sketch Options */}
                  <GlassCard sx={{ p: 2.5, mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                      component="label"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                    >
                      <input type="checkbox" checked={isSketch} onChange={e => setIsSketch(e.target.checked)} style={{ display: 'none' }} />
                      <Box sx={{ width: 40, height: 22, borderRadius: 3, position: 'relative', background: isSketch ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'rgba(255,255,255,0.1)', border: `1px solid ${isSketch ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.3s', flexShrink: 0 }}>
                        <Box sx={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', left: isSketch ? 'calc(100% - 18px)' : 2, transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isSketch ? 'primary.main' : 'text.secondary', transition: 'color 0.2s' }}>
                        Tranh phác thảo (chưa tô màu)
                      </Typography>
                    </Box>
                    <AnimatePresence>
                      {isSketch && (
                        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            {[
                              { val: selectedStyle, setter: setSelectedStyle, opts: [['Nhẹ nhàng (Pastel)', 'Pastel'], ['Vui tươi (Vibrant)', 'Vui tươi'], ['U buồn (Melancholy)', 'U buồn'], ['Cổ điển (Vintage)', 'Cổ điển'], ['Hiện đại (Modern)', 'Hiện đại']] },
                              { val: paintType, setter: setPaintType, opts: [['Poster Color', 'Poster Color'], ['Watercolor', 'Watercolor'], ['Acrylic', 'Acrylic'], ['Oil Paint', 'Oil Paint'], ['Digital Art', 'Digital Art']] },
                            ].map((sel, idx) => (
                              <Box key={idx} component="select" value={sel.val} onChange={(e: any) => sel.setter(e.target.value)}
                                sx={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, px: 1.5, py: 1, color: 'text.primary', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}>
                                {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                              </Box>
                            ))}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>

                  {/* Upload Zone */}
                  <motion.div
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={handleDrop}
                    style={{
                      width: '100%', aspectRatio: '16/9', borderRadius: 24,
                      border: `2px dashed ${isDragging ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                      background: isDragging ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease',
                      boxShadow: isDragging ? '0 0 40px rgba(245,158,11,0.2)' : 'none',
                    }}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

                    {/* Decorative corners */}
                    {[{ t: 16, l: 16, bt: true, bl: true }, { t: 16, r: 16, bt: true, br: true }, { b: 16, l: 16, bb: true, bl: true }, { b: 16, r: 16, bb: true, br: true }].map((c, i) => (
                      <Box key={i} sx={{ position: 'absolute', width: 20, height: 20, ...c,
                        borderTop: (c as any).bt ? `2px solid ${isDragging ? '#f59e0b' : 'rgba(255,255,255,0.15)'}` : 'none',
                        borderBottom: (c as any).bb ? `2px solid ${isDragging ? '#f59e0b' : 'rgba(255,255,255,0.15)'}` : 'none',
                        borderLeft: (c as any).bl ? `2px solid ${isDragging ? '#f59e0b' : 'rgba(255,255,255,0.15)'}` : 'none',
                        borderRight: (c as any).br ? `2px solid ${isDragging ? '#f59e0b' : 'rgba(255,255,255,0.15)'}` : 'none',
                        transition: 'border-color 0.3s',
                      }} />
                    ))}

                    <motion.div animate={isDragging ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.4 }}>
                      <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${isDragging ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, color: isDragging ? '#f59e0b' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }}>
                        <UploadCloud size={36} />
                      </Box>
                    </motion.div>
                    <Typography variant="h6" sx={{ color: isDragging ? 'primary.main' : 'text.primary', mb: 1, fontWeight: 500, transition: 'color 0.3s' }}>
                      Phóng tác phẩm của bạn
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.72rem' }}>
                      Kéo thả hoặc nhấn để chọn ảnh
                    </Typography>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%' }}>
                  <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', boxShadow: '0 32px 80px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' }}>
                    <img src={imageSrc} alt="Uploaded artwork" style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', display: 'block', background: '#08080f' }} />
                    <AnimatePresence>{isAnalyzing && <ArtLoader />}</AnimatePresence>
                  </Box>
                  {!isAnalyzing && (
                    <Zoom in>
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <GhostButton onClick={resetApp} size="large"
                          startIcon={<motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}><RefreshCw size={18} /></motion.div>}
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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 16, width: '100%' }}>
                  <Box sx={{ p: 2, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 2, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertTriangle size={16} /><Typography variant="body2">{error}</Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        {/* ===== RIGHT: Analysis Sidebar ===== */}
        <AnimatePresence>
          {(isAnalyzing || analysisResult) && (
            <motion.aside
              key="sidebar"
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              style={{
                width: '100%', maxWidth: 460, height: '100vh', overflowY: 'auto',
                flexShrink: 0, display: 'flex', flexDirection: 'column',
                background: 'rgba(6,6,12,0.9)', backdropFilter: 'blur(40px)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
              }}
            >
              <Box sx={{ p: { xs: 2.5, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Sidebar Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex' }}>
                      <ImageIcon size={20} color="#f59e0b" />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700 }}>
                      Khai phá Nghệ thuật
                    </Typography>
                  </Box>
                </motion.div>

                {/* Loading Skeletons */}
                {isAnalyzing ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[80, 100, 100, 0].map((h, i) =>
                      h ? <Box key={i} className="shimmer" sx={{ height: h, borderRadius: 2 }} /> :
                        <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                          {[0, 1, 2, 3].map(j => <Box key={j} className="shimmer" sx={{ height: 130, borderRadius: 2 }} />)}
                        </Box>
                    )}
                  </Box>
                ) : analysisResult ? (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Tabs */}
                    <Box sx={{ mb: 3, background: 'rgba(255,255,255,0.03)', borderRadius: 3, p: 0.75, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        variant="fullWidth"
                        slotProps={{ indicator: { style: { display: 'none' } } } as any}
                        sx={{
                          minHeight: 40,
                          '& .MuiTab-root': { minHeight: 40, borderRadius: 2, color: 'text.secondary', transition: 'all 0.25s' },
                          '& .Mui-selected': { color: '#000 !important', background: 'linear-gradient(135deg,#f59e0b,#f97316)', fontWeight: '700 !important' },
                        }}
                      >
                        <Tab value="current" label={isSketch ? 'Bản vẽ' : 'Hiện tại'} />
                        {!isSketch && <Tab value="optimized" label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Wand2 size={13} /><span>Tối ưu</span></Box>
                        } />}
                        <Tab value="belle" label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MessageCircle size={13} /><span>Belle</span></Box>
                        } />
                      </Tabs>
                    </Box>

                    {/* Tab Panels */}
                    <Box sx={{ flex: 1, position: 'relative' }}>
                      <AnimatePresence mode="wait">

                        {/* Current Palette Tab */}
                        {activeTab === 'current' && (
                          <motion.div key="current" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                            style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 32 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {/* Medium */}
                              <Box>
                                <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.2em', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                  <Droplet size={12} /> {isSketch ? 'Chất liệu đề xuất' : 'Chất liệu dự đoán'}
                                </Typography>
                                <GlassCard sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                                  <Box sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.04 }}><Droplet size={64} /></Box>
                                  <Typography variant="h6" sx={{ fontFamily: '"Playfair Display",serif', mb: 1 }}>{analysisResult.medium}</Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.7 }}>{analysisResult.mediumDescription}</Typography>
                                </GlassCard>
                              </Box>

                              {/* Placement Guide */}
                              {isSketch && analysisResult.placement_guide && (
                                <Box>
                                  <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.2em', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                    <Info size={12} /> Hướng dẫn tô màu
                                  </Typography>
                                  <GlassCard sx={{ p: 3 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontFamily: '"Playfair Display",serif', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                      {analysisResult.placement_guide}
                                    </Typography>
                                  </GlassCard>
                                </Box>
                              )}

                              {/* Color Palette */}
                              <Box>
                                <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.2em', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                  <Palette size={12} /> {isSketch ? 'Bảng màu đề xuất' : 'Bảng màu hiện tại'}
                                </Typography>
                                <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                  {analysisResult.current_colors.map((color, index) => {
                                    const unfitInfo = analysisResult.issue?.unfit_colors?.find(u => u.hex.toLowerCase() === color.hex.toLowerCase());
                                    return <ColorFlipCard key={index} color={color} unfitInfo={unfitInfo} />;
                                  })}
                                </motion.div>
                              </Box>
                            </Box>
                          </motion.div>
                        )}

                        {/* Optimized Tab */}
                        {!isSketch && activeTab === 'optimized' && (
                          <motion.div key="optimized" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                            style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 32 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {/* Critique */}
                              <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.2em', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                  <Sparkles size={12} /> Lời khuyên từ Belle
                                </Typography>
                                <GlassCard sx={{ p: 3 }}>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontFamily: '"Playfair Display",serif', fontStyle: 'italic', mb: 3 }}>
                                    {analysisResult.issue?.critique}
                                  </Typography>
                                  <Typography variant="overline" sx={{ fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                    <CheckCircle size={11} /> Thay thế đề xuất
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {analysisResult.suggestions?.replacement_colors?.map((color, index) => (
                                      <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <motion.div whileHover={{ scale: 1.15, y: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: color.hex, border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 4px 16px ${color.hex}44`, flexShrink: 0 }} />
                                          </motion.div>
                                          <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{color.name}</Typography>
                                              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.65rem' }}>{color.hex}</Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>{color.why}</Typography>
                                          </Box>
                                        </Box>
                                      </motion.div>
                                    ))}
                                  </Box>
                                </GlassCard>
                              </Box>

                              {/* Perfect Palette */}
                              <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.2em', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                  <Palette size={12} /> Bảng màu Hoàn mỹ
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                                  {analysisResult.suggestions.final_palette.map((color, index) => {
                                    const isSelected = selectedColor?.hex === color.hex;
                                    const textColor = getTextColor(color.hex);
                                    return (
                                      <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.06, y: -6 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedColor(color)}
                                        style={{ borderRadius: 16, padding: '16px', aspectRatio: '1', cursor: 'pointer', backgroundColor: color.hex, position: 'relative', overflow: 'hidden', boxShadow: isSelected ? `0 0 0 3px #fff, 0 0 0 5px #3b82f6` : `0 8px 24px ${color.hex}44` }}
                                      >
                                        <Typography variant="caption" style={{ color: textColor, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.58rem', display: 'block' }}>
                                          {color.role}
                                        </Typography>
                                        <Box style={{ position: 'absolute', bottom: 12, left: 12 }}>
                                          <Typography variant="body2" style={{ color: textColor, fontWeight: 700 }}>{color.name}</Typography>
                                          <Typography variant="caption" style={{ color: textColor, opacity: 0.7, fontFamily: 'monospace', fontSize: '0.62rem' }}>{color.hex}</Typography>
                                        </Box>
                                        {isSelected && (
                                          <Box style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', padding: 2, display: 'flex' }}>
                                            <CheckCircle size={14} color={textColor} />
                                          </Box>
                                        )}
                                      </motion.div>
                                    );
                                  })}
                                </Box>
                                <AnimatePresence mode="wait">
                                  {selectedColor && (
                                    <motion.div key={selectedColor.hex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                                      <GlassCard sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: selectedColor.hex }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pl: 1 }}>
                                          <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: selectedColor.hex, border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                                          <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            Công thức: {selectedColor.name}
                                          </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontFamily: '"Playfair Display",serif', fontStyle: 'italic', pl: 1 }}>
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

                        {/* Belle Chat Tab */}
                        {activeTab === 'belle' && (
                          <motion.div key="belle" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: 'rgba(4,4,10,0.6)' }}>

                            {/* Chat Header */}
                            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ position: 'relative' }}>
                                  <Avatar sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg,#f59e0b,#f97316,#ec4899)', fontSize: '1.3rem', fontFamily: '"Playfair Display",serif', transform: 'rotate(3deg)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>B</Avatar>
                                  <Box sx={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, background: '#34d399', borderRadius: '50%', border: '2px solid #04040a' }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, lineHeight: 1.2 }}>Belle</Typography>
                                  <Typography variant="caption" sx={{ color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.58rem', fontWeight: 700 }}>Nàng thơ Nghệ thuật</Typography>
                                </Box>
                              </Box>
                              <Sparkles size={16} color="rgba(255,255,255,0.3)" />
                            </Box>

                            {/* Messages */}
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <Box sx={{ maxWidth: '88%', p: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px 20px 20px 4px' }}>
                                  <Typography variant="body2" sx={{ lineHeight: 1.7, fontFamily: '"Playfair Display",serif', fontStyle: 'italic' }} className="typewriter-cursor">
                                    Chào Tuấn! Mình là Belle, nàng thơ ảo của Belleza Lab. Có điều gì bạn muốn khám phá thêm không?
                                  </Typography>
                                </Box>
                              </motion.div>

                              {chatHistory.map((msg, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                  <Box sx={{
                                    maxWidth: '88%', p: 2,
                                    ...(msg.role === 'user'
                                      ? { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: '20px 20px 4px 20px', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }
                                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px 20px 20px 4px' }),
                                  }}>
                                    <Typography variant="body2" sx={{ lineHeight: 1.7, fontFamily: msg.role === 'model' ? '"Playfair Display",serif' : 'inherit', fontStyle: msg.role === 'model' ? 'italic' : 'normal', whiteSpace: 'pre-wrap' }}>
                                      {msg.text}
                                    </Typography>
                                  </Box>
                                </motion.div>
                              ))}

                              {isChatting && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                  <Box sx={{ p: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px 20px 20px 4px', display: 'inline-flex', gap: 0.6, alignItems: 'center' }}>
                                    {[0, 1, 2].map(i => (
                                      <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                                    ))}
                                  </Box>
                                </motion.div>
                              )}
                              <div ref={chatEndRef} />
                            </Box>

                            {/* Chat Footer */}
                            <Box sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(4,4,10,0.5)', flexShrink: 0 }}>
                              {chatHistory.length === 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                  {[{ t: 'Bố cục đã ổn chưa?', i: '🎨' }, { t: 'Gợi ý cách vẽ mây.', i: '💡' }, { t: 'Hợp với không gian nào?', i: '🏠' }].map((btn, i) => (
                                    <Chip key={i} label={`${btn.i} ${btn.t}`} size="small" onClick={() => handleSendMessage(btn.t)}
                                      sx={{ cursor: 'pointer', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { borderColor: 'rgba(245,158,11,0.4)', color: 'primary.main' } }} />
                                  ))}
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <GoldButton size="small" startIcon={<Award size={14} />} onClick={() => handleSendMessage('', true)} disabled={isChatting} sx={{ px: 2, py: 0.8, fontSize: '0.75rem' }}>
                                  Final Review
                                </GoldButton>
                                {finalReviewText && (
                                  <GhostButton size="small" startIcon={<ImageIcon size={14} />} onClick={() => setShowPaletteCard(true)} sx={{ px: 2, py: 0.8, fontSize: '0.75rem' }}>
                                    Xem Thẻ Màu
                                  </GhostButton>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField
                                  fullWidth size="small" value={chatInput}
                                  onChange={e => setChatInput(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage(chatInput)}
                                  placeholder="Hỏi Belle về bức tranh..."
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, background: 'rgba(0,0,0,0.3)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(245,158,11,0.4)' }, '&.Mui-focused fieldset': { borderColor: '#f59e0b' }, '& input': { color: '#f0f0f5', fontSize: '0.85rem', '&::placeholder': { color: 'rgba(255,255,255,0.3)' } } } }}
                                />
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <IconButton
                                    onClick={() => handleSendMessage(chatInput)}
                                    disabled={!chatInput.trim() || isChatting}
                                    sx={{ width: 44, height: 44, background: chatInput.trim() ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'rgba(255,255,255,0.06)', color: chatInput.trim() ? '#000' : 'text.secondary', transition: 'all 0.25s', '&:disabled': { opacity: 0.4 } }}
                                  >
                                    <Send size={18} />
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

      {/* Palette Card Modal */}
      <AnimatePresence>
        {showPaletteCard && analysisResult && imageSrc && (
          <PaletteCard
            image={imageSrc}
            colors={analysisResult.current_colors}
            critique={finalReviewText || 'Một tác phẩm tuyệt vời thể hiện sự nhạy bén trong việc sử dụng màu sắc và ánh sáng.'}
            onClose={() => setShowPaletteCard(false)}
          />
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
