import Internships from "@/views/Internships";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <Internships />
    </ProtectedRoute>
  );
}
