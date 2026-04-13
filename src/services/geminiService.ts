import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ColorInfo {
  hex: string;
  name: string;
  mixingGuide: string;
}

export interface UnfitColor {
  hex: string;
  reason: string;
}

export interface ReplacementColor {
  hex: string;
  name: string;
  why: string;
}

export interface FinalPaletteColor {
  hex: string;
  name: string;
  role: string;
  mixingGuide: string;
}

export interface ArtAnalysisResult {
  medium: string;
  mediumDescription: string;
  current_colors: ColorInfo[];
  issue: {
    unfit_colors: UnfitColor[];
    critique: string;
  };
  suggestions: {
    replacement_colors: ReplacementColor[];
    final_palette: FinalPaletteColor[];
  };
}

export async function analyzeArt(base64Image: string, mimeType: string, signal?: AbortSignal): Promise<ArtAnalysisResult> {
  const responsePromise = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      {
        text: `Role: Professional Art Critic & Color Strategist at Belleza Lab.
Task: Analyze the color harmony of the provided image. Identify "Off-colors" (colors that disrupt the harmony) and suggest "Perfect Replacements" to achieve a flawless palette.

Analysis Requirements:
1. Medium: Predict the medium used (e.g., Oil, Watercolor, Poster color, Digital art) and explain why in Vietnamese.
2. Current Colors: Extract the dominant colors. For each, provide HEX, name in Vietnamese, and a detailed mixing guide using real-world paint names (e.g., Poster color D-A P&T, Titanium White) in Vietnamese.
3. Disharmony Detection (Issue): Find 1-2 colors in the image that feel out of place or make the composition unbalanced. Explain why in Vietnamese.
4. Professional Recommendation (Suggestions): Suggest 2-3 new replacement colors to balance the painting in Vietnamese.
5. The "Perfect Palette": Combine the best existing colors with your suggestions to create a final, harmonious 6-color palette. For each, provide HEX, name, role (Main/Accent/Balance), and a detailed mixing guide in Vietnamese.

Output Format: Strict JSON matching the schema. Do not include markdown formatting or extra text.`,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medium: { type: Type.STRING, description: "Predicted medium of the painting in Vietnamese" },
          mediumDescription: { type: Type.STRING, description: "Brief explanation of why this medium was predicted in Vietnamese" },
          current_colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING },
                mixingGuide: { type: Type.STRING }
              },
              required: ["hex", "name", "mixingGuide"]
            }
          },
          issue: {
            type: Type.OBJECT,
            properties: {
              unfit_colors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ["hex", "reason"]
                }
              },
              critique: { type: Type.STRING, description: "Overall critique of the current harmony in Vietnamese" }
            },
            required: ["unfit_colors", "critique"]
          },
          suggestions: {
            type: Type.OBJECT,
            properties: {
              replacement_colors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["hex", "name", "why"]
                }
              },
              final_palette: {
                type: Type.ARRAY,
                description: "Exactly 6 colors forming the perfect palette",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                    role: { type: Type.STRING, description: "Main, Accent, or Balance" },
                    mixingGuide: { type: Type.STRING }
                  },
                  required: ["hex", "name", "role", "mixingGuide"]
                }
              }
            },
            required: ["replacement_colors", "final_palette"]
          }
        },
        required: ["medium", "mediumDescription", "current_colors", "issue", "suggestions"],
      },
    },
  });

  // Handle abort signal if provided
  if (signal) {
    return new Promise((resolve, reject) => {
      const abortHandler = () => {
        reject(new DOMException("Aborted", "AbortError"));
      };
      
      if (signal.aborted) {
        abortHandler();
        return;
      }
      
      signal.addEventListener("abort", abortHandler);
      
      responsePromise.then(response => {
        signal.removeEventListener("abort", abortHandler);
        const jsonStr = response.text?.trim() || "{}";
        resolve(JSON.parse(jsonStr) as ArtAnalysisResult);
      }).catch(err => {
        signal.removeEventListener("abort", abortHandler);
        reject(err);
      });
    });
  }

  const response = await responsePromise;
  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as ArtAnalysisResult;
}
