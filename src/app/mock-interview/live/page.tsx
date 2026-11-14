import LiveInterview from "@/views/LiveInterview";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Full-screen call UI (no sidebar), with the usual auth, onboarding and persona checks.
export default function Page() {
  return (
    <ProtectedRoute withLayout={false}>
      <LiveInterview />
    </ProtectedRoute>
  );
}
