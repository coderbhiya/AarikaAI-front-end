import axiosInstance from "@/lib/axios";
import type { AssessmentBlueprint, Question } from "./AssessmentQuestionRepository";
import { mapCompanyPaper } from "./companyPaper";

const generateQuestion = async (
  blueprint: AssessmentBlueprint,
  index: number,
  topic: string,
  difficulty: string,
  excludeTexts?: string[]
): Promise<Question> => {
  // Company papers are fetched once per exam session by
  // AssessmentGenerationQueue (fetchCompanyPaper below); this path only
  // generates the questions a paper doesn't cover.
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
    // type/maxMarks (mcq vs short_answer/long_answer) are new fields the
    // backend added — default them so older cached responses without these
    // fields still behave as plain MCQ.
    const data = response.data.data;
    return {
      ...data,
      type: data.type || 'mcq',
      maxMarks: data.maxMarks ?? 1,
    };
  }
  throw new Error(response.data?.error || "Failed to generate question");
};

export class QuestionGenerationEngine {
  /** Assembles a whole company paper (one POST /company-assessment/start) as simulator questions. */
  static async fetchCompanyPaper(blueprint: AssessmentBlueprint): Promise<Question[]> {
    const res = await axiosInstance.post("/company-assessment/start", {
      testName: blueprint.exam || "Google SDE OA",
    });
    if (!res.data?.success || !Array.isArray(res.data.data?.sections)) {
      throw new Error(res.data?.error || "Company paper could not be assembled");
    }
    const questions = mapCompanyPaper(res.data.data);
    if (questions.length === 0) throw new Error("Company paper has no questions");
    return questions;
  }
  
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
