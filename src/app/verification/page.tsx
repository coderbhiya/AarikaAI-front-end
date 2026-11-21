import VerificationPage from "@/views/VerificationPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <VerificationPage />
    </ProtectedRoute>
  );
}
