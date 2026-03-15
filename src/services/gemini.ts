import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function decodeSlang(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following GenZ slang into standard English and explain the vibe: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING },
          explanation: { type: Type.STRING },
          example: { type: Type.STRING },
          vibeScore: { type: Type.NUMBER, description: "0-100 score of how GenZ it is" }
        },
        required: ["translation", "explanation", "example", "vibeScore"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function decodeMeme(imageData: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: imageData.split(',')[1], mimeType } },
        { text: "Explain this meme, its origin, and why it's funny or significant in GenZ culture." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          origin: { type: Type.STRING },
          meaning: { type: Type.STRING },
          culturalContext: { type: Type.STRING }
        },
        required: ["title", "origin", "meaning", "culturalContext"]
      }
    }
  });
  return JSON.parse(response.text);
}
