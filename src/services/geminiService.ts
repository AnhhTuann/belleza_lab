import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ColorInfo {
  hex: string;
  rgb: string;
  name: string;
  mixingGuide: string;
}

export interface ArtAnalysisResult {
  colors: ColorInfo[];
  medium: string;
  mediumDescription: string;
}

export async function analyzeArt(base64Image: string, mimeType: string): Promise<ArtAnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      {
        text: "Analyze this painting. Extract the dominant colors (provide HEX, RGB, a descriptive name, and a color mixing guide for each using basic colors like red, blue, yellow, white, black). Also, predict the medium used (e.g., Oil, Watercolor, Poster color, Digital art) and provide a short description of why you think so.",
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          colors: {
            type: Type.ARRAY,
            description: "List of dominant colors extracted from the painting",
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING, description: "HEX color code, e.g., #FF0000" },
                rgb: { type: Type.STRING, description: "RGB color code, e.g., rgb(255, 0, 0)" },
                name: { type: Type.STRING, description: "Descriptive name of the color" },
                mixingGuide: { type: Type.STRING, description: "Mixing formula, e.g., 60% blue + 20% white + 20% yellow" },
              },
              required: ["hex", "rgb", "name", "mixingGuide"],
            },
          },
          medium: {
            type: Type.STRING,
            description: "Predicted medium of the painting (e.g., Oil, Watercolor, Digital art)",
          },
          mediumDescription: {
            type: Type.STRING,
            description: "Brief explanation of why this medium was predicted based on visual characteristics",
          },
        },
        required: ["colors", "medium", "mediumDescription"],
      },
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as ArtAnalysisResult;
}
