import ApiDocs from "@/views/ApiDocs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <ApiDocs />
    </ProtectedRoute>
  );
}
