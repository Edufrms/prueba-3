
import { GoogleGenAI, Type } from "@google/genai";
import { TradeFair, AIPrepResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchFairInfoFromWeb = async (query: string): Promise<Partial<TradeFair> & { sources: any[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find the official dates, location, and a brief description for the trade fair: ${query}. Please provide the response in a structured way.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  // Use a second call to structure the extracted info into JSON format if needed, 
  // but for simplicity, we'll parse the grounded text or just return it.
  return {
    description: text,
    sources: sources.map((s: any) => ({
      title: s.web?.title || 'Source',
      uri: s.web?.uri || ''
    })).filter(s => s.uri)
  };
};

export const generateMeetingPrep = async (meetingDetails: string): Promise<AIPrepResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following meeting history and goals, prepare a concise summary and 3 key questions to ask.
    
    Details: ${meetingDetails}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          suggestedQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "suggestedQuestions"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
