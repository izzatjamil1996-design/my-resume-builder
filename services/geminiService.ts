import { GoogleGenerativeAI, SchemaType } from "@google/generativeai";
import { ResumeData, Experience } from "../types";

// Baris ini penting supaya Vercel boleh baca API Key anda
const API_KEY = import.meta.env.VITE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Kita guna 'gemini-1.5-flash' sebab ini yang paling laju dan stabil
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
});

export const enhanceSummary = async (data: Partial<ResumeData>): Promise<string> => {
  const prompt = `Write a professional 3-sentence resume summary for: ${data.fullName}. Skills: ${data.skills}.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error:", error);
    return "Maaf, AI gagal menjana ringkasan.";
  }
};

export const enhanceExperienceDescription = async (exp: Experience): Promise<string> => {
  const prompt = `Improve this job description: ${exp.description} for role ${exp.position}.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return exp.description;
  }
};

export const analyzeATSCompatibility = async (resumeData: ResumeData, jobDesc: string) => {
  const prompt = `Analyze resume score (0-100) for this job: ${jobDesc}`;
  try {
    const result = await model.generateContent(prompt);
    return { score: 75, feedback: "Good", missingKeywords: [] }; // Contoh ringkas
  } catch (error) {
    return { score: 0, feedback: "Error", missingKeywords: [] };
  }
};
