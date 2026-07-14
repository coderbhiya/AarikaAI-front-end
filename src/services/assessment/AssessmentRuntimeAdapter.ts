import { AssessmentBlueprint, AssessmentQuestionRepository, Question } from "./AssessmentQuestionRepository";
import { AssessmentGenerationQueue, QuestionStatus } from "./AssessmentGenerationQueue";

export interface AssessmentState {
  blueprint: AssessmentBlueprint;
  currentIndex: number;
  answers: Map<number, string>;
  markedReview: Set<number>;
  elapsedSeconds: number;
}

export class AssessmentRuntimeAdapter {
  private repository: AssessmentQuestionRepository;
  private queue: AssessmentGenerationQueue;
  public sessionId: string;
  private state: AssessmentState;

  constructor(
    blueprint: AssessmentBlueprint, 
    sessionId: string,
    private onStatusUpdate?: (index: number, status: QuestionStatus) => void
  ) {
    this.sessionId = sessionId;
    this.repository = new AssessmentQuestionRepository(sessionId);
    
    // Resume state if exists, else create new
    this.state = this.loadState() || {
      blueprint,
      currentIndex: 0,
      answers: new Map(),
      markedReview: new Set(),
      elapsedSeconds: 0
    };

    this.queue = new AssessmentGenerationQueue(
      this.repository, 
      this.state.blueprint, 
      (idx, status) => {
        if (this.onStatusUpdate) this.onStatusUpdate(idx, status);
      }
    );

    // Initial prefetch
    this.queue.prefetchQuestions(this.state.currentIndex);
  }

  public getBlueprint(): AssessmentBlueprint {
    return this.state.blueprint;
  }

  public getAllLoadedQuestions(): Question[] {
    const total = this.state.blueprint.questions;
    const result: Question[] = [];
    for (let i = 0; i < total; i++) {
      const q = this.repository.getQuestion(i);
      if (q) result.push(q);
    }
    return result;
  }

  public async getQuestion(index: number): Promise<Question | null> {
    if (this.repository.hasQuestion(index)) {
      this.queue.prefetchQuestions(index);
      return this.repository.getQuestion(index)!;
    }
    
    // Trigger prefetch which will queue this question
    this.queue.prefetchQuestions(index);
    return null; // Return null so UI knows to show loading state
  }

  public getStatus(index: number): QuestionStatus {
    return this.queue.getStatus(index);
  }

  public retryQuestion(index: number) {
    this.queue.forceRetry(index);
  }

  public submitAnswer(index: number, answer: string) {
    this.state.answers.set(index, answer);
    this.persistState();
  }

  public toggleReview(index: number) {
    if (this.state.markedReview.has(index)) {
      this.state.markedReview.delete(index);
    } else {
      this.state.markedReview.add(index);
    }
    this.persistState();
  }

  public getAnswer(index: number): string | undefined {
    return this.state.answers.get(index);
  }

  public isMarkedReview(index: number): boolean {
    return this.state.markedReview.has(index);
  }

  public setCurrentIndex(index: number) {
    this.state.currentIndex = index;
    this.persistState();
    this.queue.prefetchQuestions(index);
  }

  public getCurrentIndex(): number {
    return this.state.currentIndex;
  }

  public updateTimer(seconds: number) {
    this.state.elapsedSeconds = seconds;
    // Don't persist every second to avoid localstorage spam, maybe every 10s
    if (seconds % 10 === 0) {
      this.persistState();
    }
  }

  public getElapsedSeconds(): number {
    return this.state.elapsedSeconds;
  }

  public clearSession() {
    this.repository.clear();
    localStorage.removeItem(`assessment_state_${this.sessionId}`);
  }

  private persistState() {
    try {
      const serialized = JSON.stringify({
        blueprint: this.state.blueprint,
        currentIndex: this.state.currentIndex,
        answers: Array.from(this.state.answers.entries()),
        markedReview: Array.from(this.state.markedReview),
        elapsedSeconds: this.state.elapsedSeconds
      });
      localStorage.setItem(`assessment_state_${this.sessionId}`, serialized);
    } catch (e) {
      console.warn("Failed to persist state", e);
    }
  }

  private loadState(): AssessmentState | null {
    try {
      const stored = localStorage.getItem(`assessment_state_${this.sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          answers: new Map(parsed.answers),
          markedReview: new Set(parsed.markedReview)
        };
      }
    } catch (e) {
      console.warn("Failed to load state", e);
    }
    return null;
  }
}
