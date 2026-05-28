import JourneyPage from "@/views/JourneyPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Journey() {
  return (
    <ProtectedRoute>
      <JourneyPage />
    </ProtectedRoute>
  );
}
