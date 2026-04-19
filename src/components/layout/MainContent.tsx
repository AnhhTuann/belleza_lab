import React from "react";
import { Box, Typography, Zoom } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, RefreshCw, AlertTriangle, Wand2, Camera } from "lucide-react";
import { GlassCard, GhostButton } from "../ui/StyledComponents";
import { ArtLoader } from "../ui/ArtLoader";

export const MainContent = ({
  imageSrc, isDragging, isAnalyzing, error,
  isSketch, setIsSketch, selectedStyle, setSelectedStyle,
  paintType, setPaintType, fileInputRef, cameraInputRef,
  handleDrop, handleFileChange, resetApp, setIsDragging,
  isDark, accentCol, dragBorderCol, dragBg, dragGlow, borderCol
}: any) => {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2.5, md: 6 },
        overflowY: { xs: "visible", md: "auto" },
        height: { xs: "auto", md: "100%" },
        minHeight: { xs: imageSrc ? "auto" : "100vh", md: "100%" },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            sx={{ fontSize: { xs: "2.8rem", md: "4.2rem" }, mb: 1, lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            Belleza Lab
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.7, fontSize: "0.92rem", letterSpacing: "0.01em" }}
          >
            Mã hóa nghệ thuật · Giải phóng bảng màu
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--text-primary)", fontFamily: '"Playfair Display", serif', fontStyle: "italic", mt: 0.5, opacity: 0.85, fontSize: "1rem" }}
          >
            Nàng thơ ảo Belle luôn bên bạn
          </Typography>
          
          <Box
            sx={{
              mt: 3, py: 1.2, px: 2, borderRadius: 2,
              background: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              display: "inline-flex", alignItems: "center", gap: 1.2,
              maxWidth: "90%", mx: "auto",
            }}
          >
            <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: isDark ? "#fca5a5" : "#b91c1c", fontSize: "0.85rem", textAlign: "left", lineHeight: 1.5 }}>
              <strong>Cảnh báo:</strong> Ứng dụng chỉ dành cho người mới tập vẽ. Nếu bạn đã biết vẽ, việc sử dụng sẽ làm mất đi sự sáng tạo.
            </Typography>
          </Box>
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
              <GlassCard
                sx={{
                  p: 2.5, mb: 3, display: "flex", flexDirection: { xs: "column", sm: "row" },
                  gap: 2, alignItems: "center", justifyContent: "space-between",
                }}
              >
                <Box component="label" sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
                  <input type="checkbox" checked={isSketch} onChange={(e) => setIsSketch(e.target.checked)} style={{ display: "none" }} />
                  <Box
                    sx={{
                      width: 38, height: 20, borderRadius: 3, position: "relative",
                      background: isSketch ? "var(--accent)" : "var(--chip-bg)",
                      border: `1px solid ${isSketch ? "var(--accent)" : "var(--chip-border)"}`,
                      transition: "all 0.3s", flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute", top: 2, width: 14, height: 14, borderRadius: "50%",
                        background: isDark ? "#fff" : isSketch ? "#fff" : "#9CA3AF",
                        left: isSketch ? "calc(100% - 16px)" : 2,
                        transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: isSketch ? "var(--accent)" : "text.secondary", transition: "color 0.2s", fontSize: "0.85rem" }}>
                    Tranh phác thảo
                  </Typography>
                </Box>
                <AnimatePresence>
                  {isSketch && (
                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        {[
                          {
                            val: selectedStyle, setter: setSelectedStyle,
                            opts: [["Nhẹ nhàng (Pastel)", "Pastel"], ["Vui tươi (Vibrant)", "Vui tươi"], ["U buồn (Melancholy)", "U buồn"], ["Cổ điển (Vintage)", "Cổ điển"], ["Hiện đại (Modern)", "Hiện đại"]],
                          },
                          {
                            val: paintType, setter: setPaintType,
                            opts: [["Poster Color", "Poster Color"], ["Watercolor", "Watercolor"], ["Acrylic", "Acrylic"], ["Oil Paint", "Oil Paint"], ["Digital Art", "Digital Art"]],
                          },
                        ].map((sel, idx) => (
                          <Box
                            key={idx} component="select" value={sel.val} onChange={(e: any) => sel.setter(e.target.value)}
                            sx={{
                              background: "var(--select-bg)", border: "1px solid var(--select-border)", borderRadius: 2,
                              px: 1.5, py: 0.8, color: "var(--text-primary)", fontSize: "0.78rem", cursor: "pointer",
                              outline: "none", fontFamily: '"Inter", sans-serif',
                            }}
                          >
                            {sel.opts.map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>

              <motion.div
                whileHover={{ scale: 1.002 }} whileTap={{ scale: 0.998 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
                style={{
                  width: "100%", 
                  borderRadius: 16,
                  border: `2px dashed ${isDragging ? dragBorderCol : borderCol}`,
                  background: isDragging ? dragBg : "var(--glass-bg)",
                  cursor: "pointer", 
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: "center", 
                  justifyContent: "center", 
                  position: "relative",
                  transition: "all 0.3s ease",
                  boxShadow: isDragging ? dragGlow : "none",
                  padding: "60px 24px",
                  minHeight: 360,
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: "none" }} />
                {[
                  { top: 18, left: 18, bt: true, bl: true },
                  { top: 18, right: 18, bt: true, br: true },
                  { bottom: 18, left: 18, bb: true, bl: true },
                  { bottom: 18, right: 18, bb: true, br: true },
                ].map((c: any, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute", width: 24, height: 24,
                      ...(c.top !== undefined && { top: c.top }),
                      ...(c.bottom !== undefined && { bottom: c.bottom }),
                      ...(c.left !== undefined && { left: c.left }),
                      ...(c.right !== undefined && { right: c.right }),
                      borderTop: c.bt ? `2px solid ${isDragging ? dragBorderCol : borderCol}` : "none",
                      borderBottom: c.bb ? `2px solid ${isDragging ? dragBorderCol : borderCol}` : "none",
                      borderLeft: c.bl ? `2px solid ${isDragging ? dragBorderCol : borderCol}` : "none",
                      borderRight: c.br ? `2px solid ${isDragging ? dragBorderCol : borderCol}` : "none",
                      transition: "border-color 0.3s",
                      opacity: 0.6
                    }}
                  />
                ))}
                <motion.div animate={isDragging ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.4 }}>
                  <Box
                    sx={{
                      width: 80, height: 80, borderRadius: "50%", background: "var(--accent-subtle)",
                      border: `1px solid ${isDragging ? accentCol : borderCol}`,
                      display: "flex", alignItems: "center", justifyContent: "center", mb: 3,
                      color: isDragging ? accentCol : "var(--text-secondary)", transition: "all 0.3s",
                    }}
                  >
                    <UploadCloud size={36} />
                  </Box>
                </motion.div>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: isDragging ? accentCol : "text.primary", 
                    mb: 1, 
                    fontWeight: 700, 
                    transition: "color 0.3s", 
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                    textAlign: "center",
                    px: 2
                  }}
                >
                  Phác họa tác phẩm của bạn
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "text.secondary", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.15em", 
                    fontSize: "0.75rem", 
                    mb: 4,
                    textAlign: "center",
                    maxWidth: "80%"
                  }}
                >
                  Kéo thả hoặc nhấn để chọn ảnh từ thư viện
                </Typography>
                
                <Box sx={{ display: "flex", gap: 2 }}>
                  <GhostButton 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    sx={{ 
                      background: "var(--accent-subtle)", 
                      color: "var(--accent)", 
                      border: `1px solid var(--accent)44`,
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    <Camera size={18} style={{ marginRight: 10 }} /> Chụp ảnh ngay
                  </GhostButton>
                </Box>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ width: "100%" }}>
              <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", border: `1px solid ${borderCol}`, boxShadow: isDark ? "0 24px 60px -12px rgba(0,0,0,0.6)" : "0 16px 48px -12px rgba(0,0,0,0.12)" }}>
                <img src={imageSrc} alt="Uploaded artwork" style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain", display: "block", background: "var(--img-preview-bg)" }} />
                <AnimatePresence>{isAnalyzing && <ArtLoader />}</AnimatePresence>
              </Box>
              {!isAnalyzing && (
                <Zoom in>
                  <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                    <GhostButton onClick={resetApp} size="large" startIcon={<motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}><RefreshCw size={18} /></motion.div>}>
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 16, width: "100%" }}>
              <Box sx={{ p: 2, background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 2, color: "var(--error-text)", display: "flex", alignItems: "center", gap: 1 }}>
                <AlertTriangle size={16} />
                <Typography variant="body2">{error}</Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};
