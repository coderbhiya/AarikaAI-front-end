import JobDetail from "@/views/JobDetail";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <JobDetail />
    </ProtectedRoute>
  );
}
