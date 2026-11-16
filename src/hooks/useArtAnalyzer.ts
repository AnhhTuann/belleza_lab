import React, { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import {
  analyzeArt,
  ArtAnalysisResult,
  FinalPaletteColor,
  ChatMessage,
} from "../services/geminiService";
import type { Language } from "../i18n";
import { useLanguage } from "../i18n";

export const useArtAnalyzer = (
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  language: Language,
) => {
  const { t } = useLanguage();
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
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isSketch, setIsSketch] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("Nhẹ nhàng (Pastel)");
  const [paintType, setPaintType] = useState("Poster Color");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    [],
  );

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
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("chooseImage"));
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
            language,
            signal,
          );
          setAnalysisResult(analysis);
          if (isSketch && analysis.determined_mood) {
            setChatHistory([
              {
                role: "model",
                text: t("sketchGreeting")
                  .replace("{mood}", analysis.determined_mood)
                  .replace("{style}", analysis.suggested_style),
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
            setError(err instanceof Error ? err.message : t("analysisFailure"));
          }
        } finally {
          if (!signal.aborted) setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
      setError(t("imageProcessingFailure"));
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

  return {
    imageSrc,
    base64Image,
    mimeType,
    isDragging,
    setIsDragging,
    isAnalyzing,
    setIsAnalyzing,
    analysisResult,
    setAnalysisResult,
    error,
    setError,
    activeTab,
    setActiveTab,
    selectedColor,
    setSelectedColor,
    isSketch,
    setIsSketch,
    selectedStyle,
    setSelectedStyle,
    paintType,
    setPaintType,
    fileInputRef,
    cameraInputRef,
    resetApp,
    handleDrop,
    handleFileChange,
  };
};
