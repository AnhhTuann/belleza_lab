import { useState } from "react";
import { chatWithBelle, ChatMessage, ArtAnalysisResult } from "../services/geminiService";
import type { Language } from "../i18n";
import { useLanguage } from "../i18n";

export const useBelleChat = (
  base64Image: string | null, 
  mimeType: string | null, 
  analysisResult: ArtAnalysisResult | null,
  language: Language,
) => {
  const { t } = useLanguage();
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
      ? t("finalReviewMessage")
      : text.trim();
    
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsChatting(true);
    
    try {
      const prompt = isFinalReview
        ? t("finalReviewPrompt")
        : userMessage;
      
      const responseText = await chatWithBelle(
        prompt,
        chatHistory,
        base64Image,
        mimeType,
        analysisResult,
        language,
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
          text:
            err instanceof Error
              ? err.message
              : t("chatFailure"),
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
