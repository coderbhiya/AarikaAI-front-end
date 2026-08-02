import axiosInstance from "@/lib/axios";
import { AssessmentBlueprint, Question } from "./AssessmentQuestionRepository";

const generateQuestion = async (
  blueprint: AssessmentBlueprint,
  index: number,
  topic: string,
  difficulty: string,
  excludeTexts?: string[]
): Promise<Question> => {
  const isCompany = (blueprint.exam || "").toLowerCase().includes("google") ||
    (blueprint.exam || "").toLowerCase().includes("tcs") ||
    (blueprint.exam || "").toLowerCase().includes("infosys") ||
    (blueprint.exam || "").toLowerCase().includes("amazon") ||
    (blueprint.exam || "").toLowerCase().includes("meta") ||
    (blueprint.exam || "").toLowerCase().includes("goldman");

  if (isCompany) {
    try {
      const compRes = await axiosInstance.post("/company-assessment/start", {
        testName: blueprint.exam || "Google SDE OA",
      });

      if (compRes.data && compRes.data.success && compRes.data.data?.sections) {
        const paper = compRes.data.data;
        const allQuestions: any[] = [];
        paper.sections.forEach((sec: any) => {
          if (sec.questions) allQuestions.push(...sec.questions);
        });

        if (allQuestions[index]) {
          const q = allQuestions[index];
          return {
            _id: q.id || index + 1,
            question: q.problemStatement || q.question || "Write an algorithm solution.",
            options: q.options || ["Solution Code"],
            correctAnswer: q.correctAnswer || "Solution Code",
            explanation: q.constraints ? `Constraints: ${q.constraints}` : "Execute code against test cases.",
          };
        }
      }
    } catch (compErr) {
      console.warn("[QuestionGenerationEngine] Company assessment endpoint fallback:", compErr);
    }
  }

  const response = await axiosInstance.post(
    `/assessment/generate-question`, 
    { 
      blueprint, 
      index, 
      topic, 
      difficulty,
      language: blueprint.language || "English",
      excludeTexts
    }
  );

  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data?.error || "Failed to generate question");
};

export class QuestionGenerationEngine {
  
  static async generateWithRetry(
    blueprint: AssessmentBlueprint,
    index: number,
    topic: string,
    difficulty: string,
    excludeTexts: string[] = [],
    maxRetries = 3
  ): Promise<Question> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const question = await generateQuestion(blueprint, index, topic, difficulty, excludeTexts);
        return question;
      } catch (error) {
        attempt++;
        console.warn(`[QuestionGenerationEngine] Failed to generate Q${index + 1}. Attempt ${attempt}/${maxRetries}`, error);
        
        if (attempt >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s...
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise(res => setTimeout(res, backoffMs));
      }
    }
    
    throw new Error("Max retries exceeded");
  }
}
