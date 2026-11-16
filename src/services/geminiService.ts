export interface ColorInfo {
  hex: string;
  name: string;
  mixingGuide: string;
  role?: string;
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

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function analyzeArt(
  base64Image: string,
  mimeType: string,
  isSketch: boolean = false,
  selectedStyle: string = "Gentle",
  paintType: string = "Poster Color",
  signal?: AbortSignal
): Promise<ArtAnalysisResult> {
  return postJson<ArtAnalysisResult>(
    "/api/analyze",
    { base64Image, mimeType, isSketch, selectedStyle, paintType },
    signal,
  );
}

export async function chatWithBelle(
  message: string,
  history: ChatMessage[],
  base64Image: string,
  mimeType: string,
  analysisResult: ArtAnalysisResult,
  signal?: AbortSignal
): Promise<string> {
  const data = await postJson<{ text: string }>(
    "/api/chat",
    { message, history, base64Image, mimeType, analysisResult },
    signal,
  );
  return data.text;
}
