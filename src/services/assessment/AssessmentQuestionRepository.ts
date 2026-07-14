export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  _id?: number | null; // DB question ID for analytics tracking
}

export interface AssessmentBlueprint {
  exam: string;
  language?: string;
  questions: number;
  durationMinutes: number;
  difficulty: { easy: number; medium: number; hard: number };
  distribution: Record<string, number>;
}

export class AssessmentQuestionRepository {
  private questions: Map<number, Question> = new Map();

  constructor(private sessionId: string) {
    this.loadFromCache();
  }

  saveQuestion(index: number, question: Question): void {
    this.questions.set(index, question);
    this.persistToCache();
  }

  getQuestion(index: number): Question | undefined {
    return this.questions.get(index);
  }

  hasQuestion(index: number): boolean {
    return this.questions.has(index);
  }

  getGeneratedCount(): number {
    return this.questions.size;
  }

  getAllQuestionTexts(): string[] {
    return Array.from(this.questions.values()).map(q => q.question);
  }

  updateQuestion(index: number, question: Question): void {
    if (this.questions.has(index)) {
      this.questions.set(index, question);
      this.persistToCache();
    }
  }

  deleteQuestion(index: number): void {
    this.questions.delete(index);
    this.persistToCache();
  }
  
  clear(): void {
    this.questions.clear();
    localStorage.removeItem(`assessment_questions_${this.sessionId}`);
  }

  private persistToCache() {
    try {
      const serialized = JSON.stringify(Array.from(this.questions.entries()));
      localStorage.setItem(`assessment_questions_${this.sessionId}`, serialized);
    } catch (error) {
      console.warn("Failed to persist questions to cache", error);
    }
  }

  private loadFromCache() {
    try {
      const stored = localStorage.getItem(`assessment_questions_${this.sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.questions = new Map(parsed);
      }
    } catch (error) {
      console.warn("Failed to load questions from cache", error);
    }
  }
}
