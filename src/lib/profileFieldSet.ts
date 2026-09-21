// Which set of Profile-page fields to show for a given user. Decided once at
// onboarding (backend: completeOnboarding) and stored as
// UserProfile.profileFieldSet — read that directly when present. Accounts
// onboarded before that field existed have it as null, so fall back to
// re-deriving it from personaType + studentDetails.educationLevel the same
// way the backend does.
export type ProfileFieldSet = "school" | "college" | "professional" | "job_seeker" | "career_switcher" | "govt_aspirant";

export function getProfileFieldSet(user: any): ProfileFieldSet {
  const profile = user?.UserProfile;
  if (!profile) return "professional";
  if (profile.profileFieldSet) return profile.profileFieldSet as ProfileFieldSet;

  if (profile.personaType === "STUDENT") {
    return profile.studentDetails?.educationLevel === "school" ? "school" : "college";
  }
  if (profile.personaType === "JOB_SEEKER") return "job_seeker";
  if (profile.personaType === "CAREER_SWITCHER") return "career_switcher";
  if (profile.personaType === "GOVT_ASPIRANT") return "govt_aspirant";
  return "professional";
}
