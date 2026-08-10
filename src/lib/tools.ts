import { AITool } from "@/types";

export const AI_TOOLS: AITool[] = [
  {
    id: "campus_prep",
    name: "Campus Placement Engine",
    shortName: "Campus Prep",
    description: "Company-specific placement test pattern & interview prep (TCS, Infosys, Wipro, Accenture, Amazon, Google)",
    category: "campus",
    icon: "Building2",
    badge: "Popular",
    placeholder: "Ask for TCS NQT exam pattern, Aptitude mock test, or Infosys coding questions...",
    samplePrompts: [
      "Generate TCS NQT 2026 Aptitude & Reasoning mock test pattern with 5 questions.",
      "Infosys Pseudo-code & Data Structures technical assessment practice.",
      "Accenture Communication & Technical round question breakdown."
    ]
  },
  {
    id: "resume_generator",
    name: "AI Resume Builder & Tailorer",
    shortName: "Resume Gen",
    description: "Generate tailored PDF resumes, ATS keyword matching & resume sections",
    category: "resume",
    icon: "FileText",
    badge: "Essential",
    placeholder: "Generate ATS resume for Frontend Developer role or upload existing resume to tailor...",
    samplePrompts: [
      "Generate an ATS-friendly resume for a Senior Full Stack Engineer role.",
      "Tailor my resume summary and work experience bullets for Google Product Manager role.",
      "Analyze ATS keyword match score for my profile against Software Engineer job."
    ]
  },
  {
    id: "exam_simulator",
    name: "Quiz & Exam Simulator",
    shortName: "Exam Simulator",
    description: "Interactive timed mock tests with instant scoring and detailed explanations",
    category: "exam",
    icon: "GraduationCap",
    badge: "Interactive",
    placeholder: "Specify topic (e.g. React.js, Python, System Design) to launch interactive exam...",
    samplePrompts: [
      "Create a 5-question timed quiz on React 19 Hooks and Performance optimization.",
      "Launch System Design mock exam with scenario questions & architecture scoring.",
      "Python Data Structures & Algorithms interactive assessment test."
    ]
  },
  {
    id: "skill_swot",
    name: "Skill Gap & SWOT Analyzer",
    shortName: "Skill & SWOT",
    description: "Analyze profile strengths, weaknesses, opportunities, threats & target job gaps",
    category: "analytics",
    icon: "BarChart3",
    placeholder: "Analyze my skill gap for Data Scientist or generate personal SWOT matrix...",
    samplePrompts: [
      "Generate my personal SWOT analysis matrix for target role Cloud Architect.",
      "Compare my current skills with AI Engineer role and show skill gap matrix.",
      "What core technical skills am I missing for DevOps Tech Lead?"
    ]
  },
  {
    id: "career_roadmap",
    name: "Career Roadmap Generator",
    shortName: "Roadmap Gen",
    description: "Step-by-step career path, timeline milestones, and learning roadmap",
    category: "career",
    icon: "MapPin",
    placeholder: "Describe target career goal (e.g. Become AI Engineer in 6 months)...",
    samplePrompts: [
      "Create a 6-month step-by-step career roadmap to become a Senior Frontend Architect.",
      "Learning path & milestones for transitioning from QA Engineer to Full Stack Developer.",
      "Cybersecurity Engineer career growth roadmap and key certifications needed."
    ]
  },
  {
    id: "study_guide",
    name: "Study Guide & Revision Notes",
    shortName: "Study Guide",
    description: "Comprehensive topic revision notes, cheat sheets, and technical study guides",
    category: "study",
    icon: "BookOpen",
    placeholder: "Enter topic (e.g. Microservices, SQL Indexes) to generate study guide...",
    samplePrompts: [
      "Generate a comprehensive study guide on Database Indexing and B-Trees.",
      "JavaScript Event Loop & Asynchronous execution revision cheat sheet.",
      "Docker & Kubernetes core concepts revision guide for tech interviews."
    ]
  }
];

export const getToolById = (id?: string): AITool | undefined => {
  if (!id) return undefined;
  return AI_TOOLS.find((tool) => tool.id === id);
};
