import React from "react";
import { Box, FormControlLabel, Switch, Typography, Zoom } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Camera, ImagePlus, RefreshCw, UploadCloud } from "lucide-react";
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
      className="studio-main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2.5, sm: 4, md: 6 },
        overflowY: { xs: "visible", md: "auto" },
        height: { xs: "auto", md: "100%" },
        minHeight: { xs: imageSrc ? "auto" : "100vh", md: "100%" },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="studio-header"
        >
          <Typography className="studio-eyebrow">
            <span className="studio-eyebrow-mark" />
            KHÔNG GIAN SÁNG TẠO CÙNG BELLE
          </Typography>
          <Typography
            variant="h1"
            className="animated-logo"
            sx={{ fontSize: { xs: "2.75rem", sm: "3.5rem", md: "4rem" }, mb: 1.5, lineHeight: 1.08, letterSpacing: "-0.035em" }}
          >
            Belleza Lab
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 440, mx: "auto", lineHeight: 1.75, fontSize: { xs: "0.9rem", sm: "0.98rem" } }}
          >
            Khám phá sắc màu và tìm cảm hứng mới cho tác phẩm của bạn.
          </Typography>
        </motion.header>

        <AnimatePresence mode="wait">
          {!imageSrc ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              style={{ width: "100%" }}
            >
              <GlassCard className="studio-settings" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5 }}>
                <Box className="studio-mode-row">
                  <Box className="studio-mode-copy">
                    <Box className="studio-mode-icon">
                      <ImagePlus size={18} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.92rem" }}>Chế độ phác thảo</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
                        Gợi ý màu sắc và cách phối màu
                      </Typography>
                    </Box>
                  </Box>
                  <FormControlLabel
                    className="studio-switch"
                    control={
                      <Switch
                        checked={isSketch}
                        onChange={(event) => setIsSketch(event.target.checked)}
                        slotProps={{ input: { "aria-label": "Bật chế độ phác thảo" } }}
                      />
                    }
                    label={isSketch ? "Đang bật" : "Tắt"}
                    labelPlacement="start"
                  />
                </Box>

                <AnimatePresence initial={false}>
                  {isSketch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <Box className="studio-options">
                        <Box className="studio-select-field">
                          <Typography component="label" htmlFor="sketch-style">Phong cách</Typography>
                          <Box
                            id="sketch-style"
                            component="select"
                            value={selectedStyle}
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelectedStyle(event.target.value)}
                          >
                            <option value="Nhẹ nhàng (Pastel)">Nhẹ nhàng (Pastel)</option>
                            <option value="Vui tươi">Vui tươi</option>
                            <option value="U buồn">U buồn</option>
                            <option value="Cổ điển">Cổ điển</option>
                            <option value="Hiện đại">Hiện đại</option>
                          </Box>
                        </Box>
                        <Box className="studio-select-field">
                          <Typography component="label" htmlFor="paint-type">Chất liệu</Typography>
                          <Box
                            id="paint-type"
                            component="select"
                            value={paintType}
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setPaintType(event.target.value)}
                          >
                            <option value="Poster Color">Poster Color</option>
                            <option value="Watercolor">Watercolor</option>
                            <option value="Acrylic">Acrylic</option>
                            <option value="Oil Paint">Oil Paint</option>
                            <option value="Digital Art">Digital Art</option>
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>

              <Box
                component={motion.div}
                whileHover={{ scale: 1.006 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event: React.DragEvent) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={(event: React.DragEvent) => { event.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Chọn hoặc thả ảnh tác phẩm để bắt đầu phân tích"
                className={`upload-zone${isDragging ? " is-dragging" : ""}`}
                sx={{
                  borderColor: isDragging ? dragBorderCol : borderCol,
                  background: isDragging ? dragBg : "var(--glass-bg)",
                  boxShadow: isDragging ? dragGlow : undefined,
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: "none" }} />
                <Box className="upload-icon" sx={{ color: isDragging ? accentCol : undefined }}>
                  <UploadCloud size={26} strokeWidth={1.7} />
                </Box>
                <Typography variant="h5" sx={{ fontSize: { xs: "1.18rem", sm: "1.35rem" }, mb: 0.75, textAlign: "center" }}>
                  {isDragging ? "Thả tác phẩm của bạn tại đây" : "Bắt đầu với một tác phẩm"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.86rem", textAlign: "center", mb: 2.5 }}>
                  Kéo thả ảnh vào đây hoặc nhấn để chọn từ thiết bị
                </Typography>
                <Box className="upload-hint">
                  <span>JPG</span><span>PNG</span><span>WEBP</span>
                  <i /> Ảnh được tự động tối ưu
                </Box>
              </Box>

              <Box className="camera-action">
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Hoặc</Typography>
                <GhostButton
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  startIcon={<Camera size={17} />}
                  sx={{ fontSize: "0.86rem", py: 0.85 }}
                >
                  Chụp ảnh
                </GhostButton>
              </Box>
            </motion.div>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ width: "100%" }}>
              <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", border: `1px solid ${borderCol}`, boxShadow: isDark ? "0 24px 60px -12px rgba(0,0,0,0.6)" : "0 16px 48px -12px rgba(0,0,0,0.12)" }}>
                <img src={imageSrc} alt="Tác phẩm đã tải lên" style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain", display: "block", background: "var(--img-preview-bg)" }} />
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
              <Box role="alert" sx={{ p: 2, background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 2, color: "var(--error-text)", display: "flex", alignItems: "center", gap: 1 }}>
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
