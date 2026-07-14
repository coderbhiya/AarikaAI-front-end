import React, { useState } from "react";
import { PlayCircle, Clock, FileText, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import FullExamSimulator from "./FullExamSimulator";

import { AssessmentBlueprint } from "../../../services/assessment/AssessmentQuestionRepository";

interface ExamSimulatorCardProps {
  blueprint: AssessmentBlueprint;
}

const ExamSimulatorCard: React.FC<ExamSimulatorCardProps> = ({ blueprint }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize data to support legacy structure
  const normalizedData = {
    title: blueprint.exam || "Practice Exam",
    subtitle: "Mock Test Blueprint",
    durationMinutes: blueprint.durationMinutes || 120,
    questions: blueprint.questions || 0
  };

  if (normalizedData.questions === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full max-w-sm mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base leading-tight">{normalizedData.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{normalizedData.subtitle}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <FileText className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Questions</span>
                <span className="font-semibold text-gray-900 leading-none">{normalizedData.questions}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duration</span>
                <span className="text-sm font-bold text-gray-700">{normalizedData.durationMinutes} mins</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {Object.keys(blueprint.distribution || {}).slice(0, 2).map((subject, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">{subject}</span>
              </div>
            ))}
            {Object.keys(blueprint.distribution || {}).length > 2 && (
              <div className="text-xs text-gray-400 font-medium ml-5">
                +{Object.keys(blueprint.distribution || {}).length - 2} more subjects
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
          >
            <PlayCircle className="w-5 h-5" /> Start Exam
          </button>
        </div>
      </div>

      {isOpen && createPortal(
        <FullExamSimulator 
          blueprint={blueprint} 
          onClose={() => setIsOpen(false)} 
        />,
        document.body
      )}
    </>
  );
};

export default ExamSimulatorCard;
