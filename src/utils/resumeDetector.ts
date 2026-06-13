export interface ResumeDetectionResult {
  isResume: boolean;
  confidence: number;
  reason: string;
}

/**
 * Heuristic based resume detection utility.
 * Analyzes the filename and extension to determine if a file is likely a resume.
 */
export const detectResume = (filename: string, fileType: string): ResumeDetectionResult => {
  const lowerName = filename.toLowerCase();
  const lowerType = fileType.toLowerCase();
  
  // Valid resume extensions
  const validExtensions = [".pdf", ".doc", ".docx"];
  const hasValidExtension = validExtensions.some(ext => lowerType.includes(ext.replace(".", "")) || lowerName.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      isResume: false,
      confidence: 0,
      reason: "Invalid file extension for a resume."
    };
  }

  // Keywords that strongly indicate a resume
  const highConfidenceKeywords = ["resume", "cv", "curriculum vitae", "curriculum_vitae", "biodata"];
  // Keywords that might indicate a resume or profile but require more context
  const mediumConfidenceKeywords = ["profile", "portfolio"];
  
  // Negative keywords that strongly indicate it's NOT a resume
  const negativeKeywords = ["invoice", "offer", "letter", "report", "receipt", "contract", "summary", "bill"];

  // Check for negative keywords first
  for (const keyword of negativeKeywords) {
    if (lowerName.includes(keyword)) {
      return {
        isResume: false,
        confidence: 10,
        reason: `Filename contains negative keyword: '${keyword}'`
      };
    }
  }

  // Check high confidence keywords
  for (const keyword of highConfidenceKeywords) {
    if (lowerName.includes(keyword)) {
      return {
        isResume: true,
        confidence: 95,
        reason: `Filename contains strong resume keyword: '${keyword}'`
      };
    }
  }

  // Check medium confidence keywords
  for (const keyword of mediumConfidenceKeywords) {
    if (lowerName.includes(keyword)) {
      return {
        isResume: true,
        confidence: 60,
        reason: `Filename contains potential profile keyword: '${keyword}'`
      };
    }
  }

  // Fallback: If it's a PDF/DOCX but has no relevant keywords
  // Many people name their resumes just with their name (e.g., "John_Doe.pdf" or "somendra_node.pdf")
  return {
    isResume: true,
    confidence: 60, // Meets the >= 60 threshold in ChatArea
    reason: "Valid extension and no negative keywords found, assuming it might be a resume."
  };
};
