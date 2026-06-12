"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { approveResumeChanges, clearPendingResume } from "@/services/profileService";
import { Briefcase, FolderGit, Award, FileSpreadsheet, Sparkles, Check, X, AlertTriangle, HelpCircle } from "lucide-react";

interface ProfileSyncModalProps {
  isOpen: boolean;
  onClose: (updated?: boolean) => void;
  pendingResumeSnapshot: {
    snapshot: any;
    diff: {
      updatedFields: Array<{
        field: string;
        label: string;
        oldValue: any;
        newValue: any;
      }>;
      addedFields: Array<{
        field: "skills" | "experiences" | "projects" | "certifications" | "educations";
        value: any;
        index?: number;
      }>;
      conflicts: Array<{
        field: string;
        label: string;
        profileValue: string;
        resumeValue: string;
        reason: string;
      }>;
    };
  } | null;
}

export const ProfileSyncModal: React.FC<ProfileSyncModalProps> = ({
  isOpen,
  onClose,
  pendingResumeSnapshot,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Selected state
  const [selectedUpdatedFields, setSelectedUpdatedFields] = useState<Record<string, boolean>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<number[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<number[]>([]);
  const [selectedEducations, setSelectedEducations] = useState<number[]>([]);
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, "keep" | "update" | "merge">>({});

  // Initialize selections when snapshot changes or modal opens
  useEffect(() => {
    if (pendingResumeSnapshot) {
      const { diff } = pendingResumeSnapshot;

      // 1. Updated Fields (Default: all checked)
      const initialUpdates: Record<string, boolean> = {};
      diff.updatedFields.forEach((uf) => {
        initialUpdates[uf.field] = true;
      });
      setSelectedUpdatedFields(initialUpdates);

      // 2. Added Skills (Default: all checked)
      const initialSkills = diff.addedFields
        .filter((af) => af.field === "skills")
        .map((af) => af.value);
      setSelectedSkills(initialSkills);

      // 3. Added Experiences (Default: all checked)
      const initialExps = diff.addedFields
        .filter((af) => af.field === "experiences" && af.index !== undefined)
        .map((af) => af.index as number);
      setSelectedExperiences(initialExps);

      // 4. Added Projects (Default: all checked)
      const initialProjs = diff.addedFields
        .filter((af) => af.field === "projects" && af.index !== undefined)
        .map((af) => af.index as number);
      setSelectedProjects(initialProjs);

      // 5. Added Certifications (Default: all checked)
      const initialCerts = diff.addedFields
        .filter((af) => af.field === "certifications" && af.index !== undefined)
        .map((af) => af.index as number);
      setSelectedCertifications(initialCerts);

      // 5b. Added Educations (Default: all checked)
      const initialEdus = diff.addedFields
        .filter((af) => af.field === "educations" && af.index !== undefined)
        .map((af) => af.index as number);
      setSelectedEducations(initialEdus);

      // 6. Conflict Resolutions (Default: 'update')
      const initialConflicts: Record<string, "keep" | "update" | "merge"> = {};
      diff.conflicts.forEach((c) => {
        initialConflicts[c.field] = "update";
      });
      setConflictResolutions(initialConflicts);
    }
  }, [pendingResumeSnapshot, isOpen]);

  if (!pendingResumeSnapshot) return null;

  const { snapshot, diff } = pendingResumeSnapshot;
  const hasChanges =
    diff.updatedFields.length > 0 ||
    diff.addedFields.length > 0 ||
    diff.conflicts.length > 0;

  const handleUpdateApproved = async () => {
    setIsLoading(true);
    try {
      const approvedFields = {
        headline: !!selectedUpdatedFields.headline,
        bio: !!selectedUpdatedFields.bio,
        currentRole: !!selectedUpdatedFields.currentRole,
        experienceYears: !!selectedUpdatedFields.experienceYears,
        location: !!selectedUpdatedFields.location,
        skills: selectedSkills,
        experiences: selectedExperiences,
        projects: selectedProjects,
        certifications: selectedCertifications,
        educations: selectedEducations,
      };

      const response = await approveResumeChanges({
        approvedFields,
        conflictResolution: conflictResolutions,
      });

      if (response.success) {
        toast.success("Your profile has been updated with the changes you approved.");
        onClose(true);
      } else {
        toast.error(response.message || "Failed to update profile changes.");
      }
    } catch (error) {
      console.error("Error approving changes:", error);
      toast.error("An error occurred while saving approved changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncEverything = async () => {
    setIsLoading(true);
    try {
      const allSkills = diff.addedFields
        .filter((af) => af.field === "skills")
        .map((af) => af.value);
      const allExps = diff.addedFields
        .filter((af) => af.field === "experiences" && af.index !== undefined)
        .map((af) => af.index as number);
      const allProjs = diff.addedFields
        .filter((af) => af.field === "projects" && af.index !== undefined)
        .map((af) => af.index as number);
      const allCerts = diff.addedFields
        .filter((af) => af.field === "certifications" && af.index !== undefined)
        .map((af) => af.index as number);
      const allEdus = diff.addedFields
        .filter((af) => af.field === "educations" && af.index !== undefined)
        .map((af) => af.index as number);

      const approvedFields = {
        headline: true,
        bio: true,
        currentRole: true,
        experienceYears: true,
        location: true,
        skills: allSkills,
        experiences: allExps,
        projects: allProjs,
        certifications: allCerts,
        educations: allEdus,
      };

      const syncConflicts: Record<string, "keep" | "update" | "merge"> = {};
      diff.conflicts.forEach((c) => {
        syncConflicts[c.field] = "update";
      });

      const response = await approveResumeChanges({
        approvedFields,
        conflictResolution: syncConflicts,
      });

      if (response.success) {
        toast.success("Your profile has been updated with the changes you approved.");
        onClose(true);
      } else {
        toast.error(response.message || "Failed to sync all changes.");
      }
    } catch (error) {
      console.error("Error syncing everything:", error);
      toast.error("An error occurred while syncing all changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIgnoreChanges = async () => {
    setIsLoading(true);
    try {
      const response = await clearPendingResume();
      if (response.success) {
        toast.info("Resume snapshot discarded.");
        onClose(false);
      } else {
        toast.error(response.message || "Failed to clear snapshot.");
      }
    } catch (error) {
      console.error("Error clearing snapshot:", error);
      toast.error("An error occurred while ignoring changes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Group added fields
  const addedSkillsList = diff.addedFields.filter((af) => af.field === "skills");
  const addedExpsList = diff.addedFields.filter((af) => af.field === "experiences");
  const addedProjsList = diff.addedFields.filter((af) => af.field === "projects");
  const addedCertsList = diff.addedFields.filter((af) => af.field === "certifications");
  const addedEdusList = diff.addedFields.filter((af) => af.field === "educations");

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-3xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] p-0">
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Review Profile Sync Details
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                We've extracted info from your uploaded resume. Choose which details you'd like to sync to your career profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable diff content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[55vh] custom-scrollbar">
          {!hasChanges ? (
            <div className="text-center py-12 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-350 dark:text-slate-600 mx-auto" />
              <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">
                No new or different information was found compared to your current profile.
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Updated Fields */}
              {diff.updatedFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                    Updated Fields
                  </h3>
                  <div className="grid gap-3">
                    {diff.updatedFields.map((uf) => (
                      <div
                        key={uf.field}
                        className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 hover:border-blue-100 dark:hover:border-blue-900/30 transition-all"
                      >
                        <Checkbox
                          id={`update-${uf.field}`}
                          checked={!!selectedUpdatedFields[uf.field]}
                          onCheckedChange={(checked) =>
                            setSelectedUpdatedFields((prev) => ({
                              ...prev,
                              [uf.field]: !!checked,
                            }))
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-bold text-slate-400 block mb-0.5">
                              {uf.label} (Current)
                            </span>
                            <p className="text-slate-600 dark:text-slate-300 text-sm italic font-medium line-clamp-2">
                              {uf.oldValue}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-blue-500 dark:text-blue-400 block mb-0.5">
                              New from Resume
                            </span>
                            <p className="text-slate-900 dark:text-white text-sm font-semibold line-clamp-2">
                              {uf.newValue}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Conflicts */}
              {diff.conflicts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Career Goal Mismatch
                  </h3>
                  {diff.conflicts.map((c) => (
                    <div
                      key={c.field}
                      className="p-5 rounded-xl border border-amber-250/50 dark:border-amber-900/20 bg-amber-50/10 dark:bg-amber-950/5 space-y-4"
                    >
                      <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{c.reason}</span>
                      </div>
                      <RadioGroup
                        value={conflictResolutions[c.field] || "keep"}
                        onValueChange={(val: "keep" | "update" | "merge") =>
                          setConflictResolutions((prev) => ({ ...prev, [c.field]: val }))
                        }
                        className="grid gap-2.5 pl-6"
                      >
                        <div className="flex items-center space-x-2.5">
                          <RadioGroupItem value="keep" id={`conflict-${c.field}-keep`} />
                          <Label
                            htmlFor={`conflict-${c.field}-keep`}
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            Keep active goal: <span className="font-bold text-slate-900 dark:text-white">"{c.profileValue}"</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2.5">
                          <RadioGroupItem value="update" id={`conflict-${c.field}-update`} />
                          <Label
                            htmlFor={`conflict-${c.field}-update`}
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            Update to resume value: <span className="font-bold text-slate-900 dark:text-white">"{c.resumeValue}"</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2.5">
                          <RadioGroupItem value="merge" id={`conflict-${c.field}-merge`} />
                          <Label
                            htmlFor={`conflict-${c.field}-merge`}
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            Merge both: <span className="font-bold text-slate-900 dark:text-white">"{c.profileValue} / {c.resumeValue}"</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}

              {/* Section 3: Skills */}
              {addedSkillsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    New Skills ({addedSkillsList.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    {addedSkillsList.map((skill) => {
                      const name = skill.value;
                      const isChecked = selectedSkills.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setSelectedSkills((prev) =>
                              isChecked ? prev.filter((s) => s !== name) : [...prev, name]
                            );
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isChecked
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50 shadow-sm"
                              : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-50"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 4: Work Experiences */}
              {addedExpsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    New Work Experiences ({addedExpsList.length})
                  </h3>
                  <div className="space-y-2">
                    {addedExpsList.map((exp) => {
                      const idx = exp.index as number;
                      const isChecked = selectedExperiences.includes(idx);
                      const data = exp.value;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                            isChecked
                              ? "border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-950/5"
                              : "border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20"
                          }`}
                        >
                          <Checkbox
                            id={`exp-${idx}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setSelectedExperiences((prev) =>
                                checked ? [...prev, idx] : prev.filter((i) => i !== idx)
                              );
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <span className="text-sm font-bold text-slate-950 dark:text-white">
                                {data.role || "Developer"}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-full">
                                {data.startDate ? new Date(data.startDate).getFullYear() : ""} -{" "}
                                {data.endDate ? new Date(data.endDate).getFullYear() : "Present"}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">
                              {data.companyName || "Previous Company"}
                            </span>
                            {data.description && (
                              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed line-clamp-2 pt-1 border-t border-dashed border-slate-100 dark:border-slate-850">
                                {data.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 5: Projects */}
              {addedProjsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FolderGit className="w-4 h-4 text-slate-400" />
                    New Projects ({addedProjsList.length})
                  </h3>
                  <div className="space-y-2">
                    {addedProjsList.map((proj) => {
                      const idx = proj.index as number;
                      const isChecked = selectedProjects.includes(idx);
                      const data = proj.value;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                            isChecked
                              ? "border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-950/5"
                              : "border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20"
                          }`}
                        >
                          <Checkbox
                            id={`proj-${idx}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setSelectedProjects((prev) =>
                                checked ? [...prev, idx] : prev.filter((i) => i !== idx)
                              );
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <span className="text-sm font-bold text-slate-950 dark:text-white block">
                              {data.name}
                            </span>
                            {data.role && (
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                                Role: {data.role}
                              </span>
                            )}
                            {data.description && (
                              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed line-clamp-2 pt-1 border-t border-dashed border-slate-100 dark:border-slate-855">
                                {data.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 6: Certifications */}
              {addedCertsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    New Certifications ({addedCertsList.length})
                  </h3>
                  <div className="space-y-2">
                    {addedCertsList.map((cert) => {
                      const idx = cert.index as number;
                      const isChecked = selectedCertifications.includes(idx);
                      const data = cert.value;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                            isChecked
                              ? "border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-950/5"
                              : "border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20"
                          }`}
                        >
                          <Checkbox
                            id={`cert-${idx}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setSelectedCertifications((prev) =>
                                checked ? [...prev, idx] : prev.filter((i) => i !== idx)
                              );
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <span className="text-sm font-bold text-slate-950 dark:text-white block">
                              {data.name}
                            </span>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {data.provider && <span>Provider: {data.provider}</span>}
                              {data.issuedDate && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>
                                    Issued: {new Date(data.issuedDate).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 7: Educations */}
              {addedEdusList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    New Education ({addedEdusList.length})
                  </h3>
                  <div className="space-y-2">
                    {addedEdusList.map((edu) => {
                      const idx = edu.index as number;
                      const isChecked = selectedEducations.includes(idx);
                      const data = edu.value;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                            isChecked
                              ? "border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-950/5"
                              : "border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20"
                          }`}
                        >
                          <Checkbox
                            id={`edu-${idx}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setSelectedEducations((prev) =>
                                checked ? [...prev, idx] : prev.filter((i) => i !== idx)
                              );
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <span className="text-sm font-bold text-slate-950 dark:text-white block">
                              {data.degree || "Degree"}
                            </span>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {data.institution && <span>{data.institution}</span>}
                              {data.year && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>{data.year}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={handleIgnoreChanges}
            disabled={isLoading}
            className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-all w-full sm:w-auto"
          >
            Ignore Changes
          </button>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            {hasChanges && (
              <button
                onClick={handleSyncEverything}
                disabled={isLoading}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all w-full sm:w-auto"
              >
                Sync Everything
              </button>
            )}
            <button
              onClick={handleUpdateApproved}
              disabled={isLoading || (hasChanges && !Object.values(selectedUpdatedFields).some(Boolean) && selectedSkills.length === 0 && selectedExperiences.length === 0 && selectedProjects.length === 0 && selectedCertifications.length === 0 && selectedEducations.length === 0)}
              className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Update Approved</span>
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
