import { AssessmentBlueprint, AssessmentQuestionRepository } from "./AssessmentQuestionRepository";
import { QuestionGenerationEngine } from "./QuestionGenerationEngine";

export type QuestionStatus = "PENDING" | "GENERATING" | "READY" | "FAILED";

export class AssessmentGenerationQueue {
  private statusMap: Map<number, QuestionStatus> = new Map();
  private PREFETCH_COUNT = 5;
  private isProcessing = false;

  constructor(
    private repository: AssessmentQuestionRepository,
    private blueprint: AssessmentBlueprint,
    private onStatusChange?: (index: number, status: QuestionStatus) => void
  ) {}

  public getStatus(index: number): QuestionStatus {
    if (this.repository.hasQuestion(index)) return "READY";
    return this.statusMap.get(index) || "PENDING";
  }

  public async prefetchQuestions(currentIndex: number) {
    for (let i = currentIndex; i < Math.min(currentIndex + this.PREFETCH_COUNT, this.blueprint.questions); i++) {
      if (this.getStatus(i) === "PENDING" || this.getStatus(i) === "FAILED") {
        this.queueQuestion(i);
      }
    }
    this.processQueue();
  }

  public async forceRetry(index: number) {
    if (this.getStatus(index) !== "READY") {
      this.queueQuestion(index);
      this.processQueue();
    }
  }

  private queueQuestion(index: number) {
    if (this.getStatus(index) === "GENERATING" || this.getStatus(index) === "READY") return;
    this.setStatus(index, "PENDING");
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        let nextIndex = -1;
        for (let i = 0; i < this.blueprint.questions; i++) {
          if (this.statusMap.get(i) === "PENDING") {
            nextIndex = i;
            break;
          }
        }

        if (nextIndex === -1) break;

        this.setStatus(nextIndex, "GENERATING");

        try {
          // Determine topic based on sequential section boundaries in blueprint.distribution
          let topic = "General";
          let accumulatedCount = 0;
          const distributionEntries = Object.entries(this.blueprint.distribution || {});

          for (const [sectionTopic, count] of distributionEntries) {
            accumulatedCount += count;
            if (nextIndex < accumulatedCount) {
              topic = sectionTopic;
              break;
            }
          }
          if (distributionEntries.length > 0 && nextIndex >= accumulatedCount) {
            topic = distributionEntries[distributionEntries.length - 1][0];
          }

          // Determine difficulty based on blueprint ratios
          let difficulty = "medium";
          const totalQs = this.blueprint.questions || 1;
          const easyLimit = Math.round(totalQs * (this.blueprint.difficulty?.easy ? this.blueprint.difficulty.easy / totalQs : 0.3));
          const hardLimit = totalQs - Math.round(totalQs * (this.blueprint.difficulty?.hard ? this.blueprint.difficulty.hard / totalQs : 0.2));

          if (nextIndex < easyLimit) {
            difficulty = "easy";
          } else if (nextIndex >= hardLimit) {
            difficulty = "hard";
          } else {
            difficulty = "medium";
          }

          const question = await QuestionGenerationEngine.generateWithRetry(
            this.blueprint,
            nextIndex,
            topic,
            difficulty,
            this.repository.getAllQuestionTexts()
          );

          this.repository.saveQuestion(nextIndex, question);
          this.setStatus(nextIndex, "READY");
        } catch (error) {
          console.error(`[AssessmentGenerationQueue] Failed to generate Q${nextIndex + 1}`, error);
          this.setStatus(nextIndex, "FAILED");
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private setStatus(index: number, status: QuestionStatus) {
    if (this.statusMap.get(index) === status) return;
    this.statusMap.set(index, status);
    if (this.onStatusChange) {
      this.onStatusChange(index, status);
    }
  }
}
