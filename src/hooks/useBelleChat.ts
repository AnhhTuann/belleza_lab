import { useState } from "react";
import { chatWithBelle, ChatMessage, ArtAnalysisResult } from "../services/geminiService";

export const useBelleChat = (
  base64Image: string | null, 
  mimeType: string | null, 
  analysisResult: ArtAnalysisResult | null
) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [finalReviewText, setFinalReviewText] = useState<string | null>(null);
  const [showPaletteCard, setShowPaletteCard] = useState(false);
  const [chatInput, setChatInput] = useState("");

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

  return {
    chatHistory, setChatHistory,
    isChatting,
    finalReviewText, setFinalReviewText,
    showPaletteCard, setShowPaletteCard,
    chatInput, setChatInput,
    handleSendMessage
  };
};
