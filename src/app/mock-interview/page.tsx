import MockInterview from "@/views/MockInterview";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <MockInterview />
    </ProtectedRoute>
  );
}
