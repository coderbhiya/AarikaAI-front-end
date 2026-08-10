import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Paperclip, 
  X, 
  ArrowRight, 
  Mic, 
  Plus, 
  Cpu, 
  Sparkles,
  Building2,
  FileText,
  GraduationCap,
  BarChart3,
  MapPin,
  BookOpen,
  Wrench,
  ChevronRight,
  Zap
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AI_TOOLS, getToolById } from "@/lib/tools";

interface ChatInputProps {
  onSendMessage: (
    message: string, 
    files?: File[], 
    webSearch?: boolean, 
    engine?: string, 
    isVisualIntel?: boolean,
    toolId?: string
  ) => void;
  onFocus?: () => void;
  isLoading?: boolean;
  fileInputShow?: boolean;
  disablePaste?: boolean;
  onStopGenerate?: () => void;
  selectedTool?: string;
  onSelectTool?: (toolId: string | undefined) => void;
}

const engines = [
  { id: "query_intent", name: "AarikaGPT" },
  { id: "retrieval", name: "Retrieval Orchestrator" },
  { id: "execution", name: "Execution Strategy Engine" },
  { id: "confidence", name: "Confidence Engine" },
  { id: "compression", name: "Compression Engine" },
];

const categoryBadgeStyles: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  campus: { bg: "bg-blue-50/90 dark:bg-blue-950/60", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 text-blue-600" },
  resume: { bg: "bg-emerald-50/90 dark:bg-emerald-950/60", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", iconBg: "bg-emerald-100 text-emerald-600" },
  exam: { bg: "bg-purple-50/90 dark:bg-purple-950/60", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", iconBg: "bg-purple-100 text-purple-600" },
  analytics: { bg: "bg-amber-50/90 dark:bg-amber-950/60", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", iconBg: "bg-amber-100 text-amber-600" },
  career: { bg: "bg-rose-50/90 dark:bg-rose-950/60", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800", iconBg: "bg-rose-100 text-rose-600" },
  study: { bg: "bg-cyan-50/90 dark:bg-cyan-950/60", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800", iconBg: "bg-cyan-100 text-cyan-600" },
};

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 size={14} className="text-blue-500" />,
  FileText: <FileText size={14} className="text-emerald-500" />,
  GraduationCap: <GraduationCap size={14} className="text-purple-500" />,
  BarChart3: <BarChart3 size={14} className="text-amber-500" />,
  MapPin: <MapPin size={14} className="text-rose-500" />,
  BookOpen: <BookOpen size={14} className="text-cyan-500" />,
};

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFocus = () => { },
  isLoading = false,
  fileInputShow = true,
  disablePaste = false,
  onStopGenerate,
  selectedTool,
  onSelectTool,
}) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedEngine, setSelectedEngine] = useState(engines[0].id);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isMobile = useIsMobile();

  const activeToolObj = getToolById(selectedTool);
  const catStyle = activeToolObj ? (categoryBadgeStyles[activeToolObj.category] || categoryBadgeStyles.campus) : undefined;

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleImageClick = () => {
    setPlusMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((message.trim() || selectedFiles.length > 0 || activeToolObj) && !isLoading) {
      onSendMessage(
        message, 
        selectedFiles, 
        true, // Web search enabled automatically by orchestrator
        selectedEngine, 
        false,
        selectedTool
      );
      setMessage("");
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disablePaste) {
      e.preventDefault();
      toast.warning("Strategic Intel: Manual input is required for this assessment to ensure accuracy.");
    }
  };

  const handleToolClick = (toolId: string) => {
    setPlusMenuOpen(false);
    if (onSelectTool) {
      if (selectedTool === toolId) {
        onSelectTool(undefined);
      } else {
        onSelectTool(toolId);
        const tool = getToolById(toolId);
        toast.success(`Attached tool tag: ${tool?.name}`);
      }
    }
  };

  return (
    <div 
      className={`w-full max-w-4xl mx-auto transition-all duration-300 ${isDragging ? "ring-2 ring-primary bg-primary/5 rounded-3xl p-2" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 px-1">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-background/90 backdrop-blur-md border border-border shadow-xs rounded-xl px-3.5 py-1.5 text-xs text-foreground font-medium animate-in zoom-in-95 duration-200"
            >
              <Paperclip size={13} className="mr-2 text-primary opacity-80" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sleek Prompt Chips ABOVE Input in 1 Single Line */}
      {activeToolObj && activeToolObj.samplePrompts?.length > 0 && (
        <div className="mb-2 flex items-center gap-1.5 px-1 overflow-x-auto scrollbar-none whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1 mr-0.5">
            <Sparkles size={11} className="text-amber-500" /> Prompts:
          </span>
          {activeToolObj.samplePrompts.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMessage(promptText)}
              title={promptText}
              className="text-[11px] bg-background/90 backdrop-blur-md hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/80 px-3 py-1 rounded-full text-foreground/80 font-normal transition-all hover:scale-[1.01] active:scale-95 shadow-2xs shrink-0 truncate max-w-[280px] sm:max-w-[340px]"
            >
              {promptText}
            </button>
          ))}
        </div>
      )}

      {/* Main Gradient Border Input Box */}
      <div className={`relative transition-all duration-500 p-[1.5px] rounded-2xl sm:rounded-[26px] bg-[linear-gradient(to_right,#4285F4,#EA4335,#FBBC05,#34A853)] ${isLoading ? "opacity-90 shadow-[0_4px_24px_rgba(0,0,0,0.06)]" : "opacity-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus-within:shadow-[0_8px_32px_rgba(66,133,244,0.15)]"}`}>
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col w-full bg-background border-none rounded-[13.5px] sm:rounded-[24.5px] group transition-all duration-300"
        >
          <div className="flex flex-col w-full px-3 sm:px-4 pt-3 pb-1.5">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={onFocus}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={
                isLoading 
                  ? "Generating response..." 
                  : (activeToolObj 
                      ? activeToolObj.placeholder 
                      : "Ask Aarika anything...")
              }
              className={`w-full bg-transparent text-foreground focus:outline-none resize-none text-[13.5px] placeholder-muted-foreground/70 font-normal min-h-[26px] sm:min-h-[30px] max-h-[200px] scrollbar-none leading-relaxed ${isLoading ? "cursor-not-allowed" : ""}`}
              rows={1}
              disabled={isLoading}
            />

            {/* Bottom Utilities Row */}
            <div className="flex items-center justify-between mt-1.5 pt-1">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-[65%]">
                
                {/* Plus (+) Button Menu */}
                {fileInputShow && (
                  <Popover open={plusMenuOpen} onOpenChange={setPlusMenuOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`p-1.5 sm:p-2 rounded-full text-foreground/80 transition-all shrink-0 flex items-center justify-center border border-transparent ${
                          plusMenuOpen ? "bg-primary/10 text-primary scale-105" : "hover:bg-muted active:scale-95 text-muted-foreground hover:text-foreground"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isLoading}
                        title="Add files or attach AI Feature Engine"
                      >
                        <Plus size={17} strokeWidth={2.5} className={plusMenuOpen ? "rotate-45 transition-transform duration-200" : "transition-transform duration-200"} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      sideOffset={8}
                      className="w-72 sm:w-80 p-2 rounded-2xl shadow-xl border border-border/80 bg-background/95 backdrop-blur-xl z-50 animate-in zoom-in-95 duration-150"
                    >
                      <div className="space-y-1">
                        {/* Section 1: File Upload */}
                        <button
                          type="button"
                          onClick={handleImageClick}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-muted text-foreground transition-colors text-left group"
                        >
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 group-hover:bg-blue-100 transition-colors">
                            <Paperclip size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">Upload Document / Resume</p>
                            <p className="text-[10px] text-muted-foreground">PDF, DOCX, TXT, Images</p>
                          </div>
                        </button>

                        <div className="h-px bg-border/60 my-1" />

                        {/* Section 2: AI Feature Tools */}
                        <div className="px-2.5 py-1 flex items-center justify-between">
                          <span className="text-[10.5px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1">
                            <Wrench size={11} className="text-primary" /> AI Feature Engines
                          </span>
                          <span className="text-[9.5px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-bold">
                            Tools
                          </span>
                        </div>

                        <div className="max-h-60 overflow-y-auto scrollbar-none space-y-0.5 pt-0.5">
                          {AI_TOOLS.map((tool) => {
                            const isSelected = selectedTool === tool.id;
                            const cat = categoryBadgeStyles[tool.category] || categoryBadgeStyles.campus;
                            return (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => handleToolClick(tool.id)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                                  isSelected 
                                    ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20" 
                                    : "hover:bg-muted text-foreground"
                                }`}
                              >
                                <span className={`p-1.5 rounded-lg border ${cat.bg} ${cat.border} shadow-2xs shrink-0`}>
                                  {iconMap[tool.icon] || <Wrench size={14} />}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="truncate font-semibold text-[12px]">{tool.name}</span>
                                    {tool.badge && (
                                      <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0.2 rounded-full font-bold ml-1 shrink-0">
                                        {tool.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">{tool.description}</p>
                                </div>
                                <ChevronRight size={13} className={`text-muted-foreground shrink-0 ${isSelected ? "text-primary" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Active Tool Tag Pill in Toolbar */}
                {activeToolObj && catStyle && (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border} shadow-2xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 shrink-0`}>
                    <span className="flex items-center justify-center">
                      {iconMap[activeToolObj.icon] || <Zap size={13} />}
                    </span>
                    <span className="font-bold tracking-tight text-[11.5px] truncate max-w-[180px] sm:max-w-[240px]">{activeToolObj.name}</span>
                    <button
                      type="button"
                      onClick={() => onSelectTool && onSelectTool(undefined)}
                      className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                      title="Remove tool tag"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 md:gap-2">
                <Select value={selectedEngine} onValueChange={setSelectedEngine} disabled={isLoading}>
                  <SelectTrigger className={`h-[28px] px-2 md:px-3 text-[10px] md:text-[11px] bg-background/60 border-border/60 rounded-full w-[100px] sm:w-[110px] md:w-[130px] font-semibold text-muted-foreground shadow-2xs transition-colors focus:ring-0 focus:ring-offset-0 shrink-0 ${isLoading ? "opacity-50" : "hover:bg-background"}`}>
                    <div className="flex items-center gap-1 md:gap-1.5 truncate">
                      <Cpu size={12} className="text-primary/80 shrink-0" />
                      <SelectValue placeholder="Engine" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-border min-w-[140px]">
                    {engines.map((engine) => (
                      <SelectItem key={engine.id} value={engine.id} className="text-[12px] font-medium rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary">
                        {engine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!message.trim() && !selectedFiles.length && !isMobile && !isLoading && (
                  <button
                    type="button"
                    onClick={() => toast.info("Voice input coming soon!")}
                    className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
                    disabled={isLoading}
                    title="Voice input (coming soon)"
                  >
                    <Mic size={17} strokeWidth={2} />
                  </button>
                )}

                {isLoading ? (
                  <button
                    type="button"
                    onClick={onStopGenerate}
                    className="p-1.5 sm:p-2 rounded-full transition-all duration-300 flex items-center justify-center bg-gray-800 text-white shadow-md hover:bg-gray-900 active:scale-95"
                    title="Stop Generating"
                  >
                    <div className="w-3.5 h-3.5 bg-background rounded-sm"></div>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!(message.trim() || selectedFiles.length > 0 || activeToolObj) || isLoading}
                    className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                      (message.trim() || selectedFiles.length > 0 || activeToolObj) && !isLoading
                        ? "bg-primary text-white shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
                        : "text-gray-300 pointer-events-none bg-transparent"
                    }`}
                  >
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-2 md:mt-3 px-2 text-center">
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-normal tracking-tight">
          AarikaAI may display inaccurate info, so double-check its responses.{" "}
          <Link href="/privacy" className="underline cursor-pointer hover:text-primary transition-colors">
            Your privacy & AarikaAI Apps
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
