
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getChristmasGameIdeas = async (members: string[]) => {
  try {
    const prompt = `Sugere 3 jogos de Natal divertidos para uma família com os seguintes membros: ${members.join(', ')}. Os jogos devem ser criativos e usar objetos comuns de casa.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['time-based', 'points-only', 'mixed'] }
            },
            required: ['name', 'description', 'type']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao obter ideias do Gemini:", error);
    return [];
  }
};
