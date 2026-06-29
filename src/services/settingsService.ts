import axiosInstance from "@/lib/axios";

export interface FeatureFlags {
  chatEnabled: boolean;
  jobRecommendationsEnabled: boolean;
  profileAnalysisEnabled: boolean;
  resumeBuilderEnabled: boolean;
  learningModuleEnabled: boolean;
  communityModuleEnabled: boolean;
}

export const getEnabledFeatures = async (): Promise<FeatureFlags> => {
  try {
    const response = await axiosInstance.get("/auth/features");
    return response.data.features;
  } catch (error) {
    console.error("[SettingsService] Error fetching enabled features:", error);
    // Return safe default features on error
    return {
      chatEnabled: true,
      jobRecommendationsEnabled: true,
      profileAnalysisEnabled: true,
      resumeBuilderEnabled: true,
      learningModuleEnabled: true,
      communityModuleEnabled: true,
    };
  }
};

export default {
  getEnabledFeatures,
};
