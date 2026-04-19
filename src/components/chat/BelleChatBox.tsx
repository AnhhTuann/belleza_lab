import React, { useRef, useEffect } from "react";
import { Box, Typography, Avatar, TextField, IconButton } from "@mui/material";
import { motion } from "motion/react";
import { Sparkles, Send, Award } from "lucide-react";
import { AccentButton } from "../ui/StyledComponents";

export const BelleChatBox = ({
  chatHistory, isChatting, chatInput, setChatInput,
  handleSendMessage,
  accentCol, borderCol, borderSubtle
}: any) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatting]);

  return (
    <motion.div
      key="belle"
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", borderRadius: 12, border: `1px solid ${borderCol}`, overflow: "hidden", background: "var(--glass-bg)" }}
    >
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${borderSubtle}`, background: "var(--chip-bg)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 44, height: 44, borderRadius: 2, background: `linear-gradient(135deg, var(--accent), #8B6914)`, fontSize: "1.2rem", fontFamily: '"Playfair Display", serif', fontWeight: 700, boxShadow: "0 3px 12px var(--accent-glow)" }}>B</Avatar>
            <Box sx={{ position: "absolute", bottom: -2, right: -2, width: 11, height: 11, background: "#34d399", borderRadius: "50%", border: "2px solid var(--bg-primary)" }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.05rem" }}>Belle</Typography>
            <Typography variant="caption" sx={{ color: accentCol, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.55rem", fontWeight: 600, opacity: 0.7 }}>Nàng thơ Nghệ thuật</Typography>
          </Box>
        </Box>
        <Sparkles size={15} style={{ color: "var(--text-muted)" }} />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Box sx={{ maxWidth: "88%", p: 2, background: "var(--bg-surface-alpha)", border: `1px solid ${borderCol}`, borderRadius: "18px 18px 18px 4px" }}>
            <Typography variant="body2" sx={{ lineHeight: 1.7, fontFamily: '"Playfair Display", serif', fontStyle: "italic", fontSize: "1.2rem" }} className="typewriter-cursor">
              Chào Tuấn! Mình là Belle, nàng thơ ảo của Belleza Lab. Có điều gì bạn muốn khám phá thêm không?
            </Typography>
          </Box>
        </motion.div>
        {chatHistory.map((msg: any, idx: number) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <Box sx={{ maxWidth: "88%", p: 2, ...(msg.role === "user" ? { background: "var(--user-bubble)", color: "#fff", borderRadius: "18px 18px 4px 18px", boxShadow: "0 3px 12px var(--user-bubble-shadow)" } : { background: "var(--bg-surface-alpha)", border: `1px solid ${borderCol}`, borderRadius: "18px 18px 18px 4px" }) }}>
              <Typography variant="body2" sx={{ lineHeight: 1.7, fontFamily: msg.role === "model" ? '"Playfair Display", serif' : "inherit", fontStyle: msg.role === "model" ? "italic" : "normal", whiteSpace: "pre-line", fontSize: "1rem" }}>
                {msg.text}
              </Typography>
            </Box>
          </motion.div>
        ))}
        {isChatting && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "flex-start" }}>
            <Box sx={{ maxWidth: "80%", p: 2, background: "var(--bg-surface-alpha)", border: `1px solid ${borderCol}`, borderRadius: "18px 18px 18px 4px", display: "flex", gap: 1 }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} style={{ width: 6, height: 6, borderRadius: "50%", background: accentCol }} />
              ))}
            </Box>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${borderSubtle}`, background: "var(--chip-bg)", display: "flex", flexDirection: "column", gap: 1.5 }}>
        <AccentButton onClick={() => handleSendMessage("", true)} disabled={isChatting} fullWidth startIcon={<Award size={16} />} sx={{ py: 1.2, borderRadius: 3, fontSize: "0.95rem", background: "linear-gradient(135deg, var(--accent), #D4AF37)", "&:hover": { background: "linear-gradient(135deg, #D4AF37, var(--accent))" } }}>
          Yêu cầu Nhận xét Cuối cùng
        </AccentButton>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth size="small" variant="outlined" placeholder="Hỏi Belle về hướng vẽ tiếp theo..."
            value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage(chatInput)}
            disabled={isChatting}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 4, background: "var(--bg-surface)",
                "& fieldset": { borderColor: borderCol },
                "&:hover fieldset": { borderColor: accentCol },
                "&.Mui-focused fieldset": { borderColor: accentCol, borderWidth: 1 }
              },
              "& input": { py: 1.5, px: 2, fontSize: "0.95rem", color: "text.primary" }
            }}
          />
          <IconButton
            onClick={() => handleSendMessage(chatInput)} disabled={isChatting || !chatInput.trim()}
            sx={{
              background: chatInput.trim() ? accentCol : "var(--glass-bg)",
              color: chatInput.trim() ? "#fff" : "var(--text-muted)",
              borderRadius: 3, width: 44, height: 44,
              "&:hover": { background: chatInput.trim() ? "var(--accent-hover)" : "var(--glass-bg)" },
              transition: "all 0.2s"
            }}
          >
            <Send size={18} style={{ marginLeft: 2 }} />
          </IconButton>
        </Box>
      </Box>
    </motion.div>
  );
};
