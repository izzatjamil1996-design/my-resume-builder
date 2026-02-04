import { GoogleGenerativeAI, SchemaType } from "@google/generativeai";
import { ResumeData, Experience } from "../types";

// Gunakan VITE_ prefix jika anda menggunakan Vite (standard untuk projek AI Studio)
// Pastikan anda menambah VITE_API_KEY di Vercel Environment Variables
const API_KEY = import.meta.env.VITE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Gunakan model yang stabil: gemini-1.5-flash
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
});

export const enhanceSummary = async (data: Partial<ResumeData>): Promise<string> => {
  const prompt = `Based on the following student information, write a professional, high-impact 3-sentence summary for a resume. Focus on achievements, skills, and career goals.
  Name: ${data.fullName}
  Skills: ${data.skills}
  Education: ${JSON.stringify(data.education)}
  Experience: ${JSON.stringify(data.experiences)}
  ---
  Provide only the summary text. No preamble.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text() || '';
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Professional summary could not be generated at this time.";
  }
};

export const enhanceExperienceDescription = async (exp: Experience): Promise<string> => {
  const prompt = `Rewrite the following job description for a resume to be more "Applicant Tracking System-friendly" and "action-oriented". 
  STRICT RULE: Use bullet points starting with strong action verbs. Highlight achievements and quantify results if possible.
  Role: ${exp.position} at ${exp.company}
  Raw Description: ${exp.description}
  ---
  Provide only the improved bullet points. No preamble. Use "•" as the bullet point marker.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text() || '';
  } catch (error) {
    console.error("Gemini Error:", error);
    return exp.description;
  }
};

export const analyzeATSCompatibility = async (resumeData: ResumeData, jobDesc: string) => {
  const prompt = `Analyze the following resume against the job description for Applicant Tracking System compatibility.
  
  RESUME:
  ${JSON.stringify(resumeData)}

  JOB DESCRIPTION:
  ${jobDesc}

  Provide a score from 0 to 100, specific feedback, and a list of missing keywords.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            feedback: { type: SchemaType.STRING },
            missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          },
          required: ["score", "feedback", "missingKeywords"]
        }
      }
    });
    return JSON.parse(result.response.text() || '{}');
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    return { score: 0, feedback: "Error analyzing resume.", missingKeywords: [] };
  }
};
