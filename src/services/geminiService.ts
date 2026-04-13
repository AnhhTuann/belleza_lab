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
  // Sketch mode fields
  is_sketch?: boolean;
  determined_mood?: string;
  suggested_style?: string;
  placement_guide?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function analyzeArt(
  base64Image: string, 
  mimeType: string, 
  isSketch: boolean = false,
  selectedStyle: string = "Gentle",
  paintType: string = "Poster Color",
  signal?: AbortSignal
): Promise<ArtAnalysisResult> {
  
  let promptText = "";
  let responseSchema: any = {};

  if (isSketch) {
    promptText = `Role: You are Belle, the professional Color Strategist at Belleza Lab.
Task: Analyze the provided sketch/line art and propose a complete, harmonious color palette to bring it to life AND provide detailed mixing recipes for a specific medium (${paintType}).

Analysis Requirements:
1. Mood Interpretation: Based on the lines (curved/sharp), subject matter, and composition, determine the inherent mood of the sketch.
2. Color Strategy: Propose a primary, secondary, and accent color.
3. The Proposed Palette: Provide a 6-color palette that fits the determined mood and a user-selected style ('${selectedStyle}'). Provide Hex codes and names.
4. Mixing Guide (The "Lab" part): For EACH color, give a step-by-step mixing guide using physical paints for ${paintType} in Vietnamese:
   - Primary colors needed (e.g., Red, Yellow, Blue, White, Black).
   - Specific ratio (e.g., 2 parts White + 1 tiny drop of Cobalt Blue).
   - Tips for the specific medium (e.g., "For poster color, add a bit of water to keep it creamy").
5. Color Placement Guide: Give brief suggestions on where to apply the main colors (e.g., "Use color #1 for the background, color #2 for the character's skin...").

Output Format: Strict JSON matching the schema. Always respond in Vietnamese.`;

    responseSchema = {
      type: Type.OBJECT,
      properties: {
        is_sketch: { type: Type.BOOLEAN, description: "Always true" },
        determined_mood: { type: Type.STRING, description: "Determined mood of the sketch in Vietnamese" },
        suggested_style: { type: Type.STRING, description: "The suggested style based on user selection in Vietnamese" },
        medium: { type: Type.STRING, description: `The requested medium: ${paintType}` },
        mediumDescription: { type: Type.STRING, description: "Brief description of the sketch lines in Vietnamese" },
        current_colors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              mixingGuide: { type: Type.STRING }
            },
            required: ["hex", "name", "role", "mixingGuide"]
          }
        },
        placement_guide: { type: Type.STRING, description: "Guide on where to place colors in Vietnamese" },
        issue: {
          type: Type.OBJECT,
          properties: {
            unfit_colors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, reason: { type: Type.STRING } } } },
            critique: { type: Type.STRING }
          }
        },
        suggestions: {
          type: Type.OBJECT,
          properties: {
            replacement_colors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, why: { type: Type.STRING } } } },
            final_palette: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, mixingGuide: { type: Type.STRING } } } }
          }
        }
      },
      required: ["is_sketch", "determined_mood", "suggested_style", "medium", "current_colors", "placement_guide"],
    };
  } else {
    promptText = `Role: Professional Art Critic & Color Strategist at Belleza Lab.
Task: Analyze the color harmony of the provided image. Identify "Off-colors" (colors that disrupt the harmony) and suggest "Perfect Replacements" to achieve a flawless palette.

Analysis Requirements:
1. Medium: Predict the medium used (e.g., Oil, Watercolor, Poster color, Digital art) and explain why in Vietnamese.
2. Current Colors: Extract the dominant colors. For each, provide HEX, name in Vietnamese, and a detailed mixing guide using real-world paint names (e.g., Poster color D-A P&T, Titanium White) in Vietnamese.
3. Disharmony Detection (Issue): Find 1-2 colors in the image that feel out of place or make the composition unbalanced. Explain why in Vietnamese.
4. Professional Recommendation (Suggestions): Suggest 2-3 new replacement colors to balance the painting in Vietnamese.
5. The "Perfect Palette": Combine the best existing colors with your suggestions to create a final, harmonious 6-color palette. For each, provide HEX, name, role (Main/Accent/Balance), and a detailed mixing guide in Vietnamese.

Output Format: Strict JSON matching the schema. Do not include markdown formatting or extra text.`;

    responseSchema = {
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
    };
  }

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
        text: promptText,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
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

export async function chatWithBelle(
  message: string,
  history: ChatMessage[],
  base64Image: string,
  mimeType: string,
  analysisResult: ArtAnalysisResult
): Promise<string> {
  const systemInstruction = `Identity: Your name is Belle, the virtual muse of Belleza Lab.
Personality: Sophisticated, encouraging, poetic yet technically skilled in painting (especially Poster colors and Digital art).
Tone of Voice: Friendly (calling the user "Tuấn"), inspiring, and professional.
Knowledge: You have access to the image analysis (colors, medium, harmony). When asked "Is this okay?", evaluate based on composition, color balance, and emotional impact.
Always respond in Vietnamese. Keep responses concise and helpful.`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `Here is the analysis of the image: ${JSON.stringify(analysisResult)}`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "Chào Tuấn! Mình là Belle, nàng thơ ảo của Belleza Lab. Mình đã xem qua bức tranh và bảng màu. Bạn muốn mình tư vấn thêm về điều gì không?",
        },
      ],
    },
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return response.text || "";
}
