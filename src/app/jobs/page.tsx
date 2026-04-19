import Jobs from "@/views/Jobs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <Jobs />
    </ProtectedRoute>
  );
}
