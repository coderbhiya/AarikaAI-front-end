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
  
  // Bug #21 fix: Expanded negative keywords — job descriptions, research papers, and
  // common business documents that are NOT resumes but were previously triggering autofill
  const negativeKeywords = [
    "invoice", "offer", "letter", "report", "receipt", "contract", "summary", "bill",
    "jd", "job_description", "job-description", "jobdescription", "job description",
    "research", "paper", "thesis", "assignment", "notes", "lecture", "syllabus",
    "proposal", "agreement", "certificate", "marksheet", "transcript_academic",
    "payslip", "salary_slip", "aadhaar", "aadhar", "pan_card", "id_proof"
  ];

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

  // Bug #21 fix: Fallback confidence lowered from 60 → 45 (below the >= 60 threshold in ChatArea).
  // Previously, ANY pdf/docx with no negative keywords was treated as a resume at confidence=60,
  // causing job descriptions and research papers to trigger profile overwrite.
  // Users who upload a truly unnamed resume can still be prompted via the chat UI to confirm.
  return {
    isResume: false,
    confidence: 45,
    reason: "Valid extension but no resume-specific keywords found. Not treating as resume automatically."
  };
};

