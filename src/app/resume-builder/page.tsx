import ResumeBuilder from "@/views/ResumeBuilder";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <ResumeBuilder />
    </ProtectedRoute>
  );
}
