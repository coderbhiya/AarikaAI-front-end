import UpdatesFaq from "@/views/UpdatesFaq";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <UpdatesFaq />
    </ProtectedRoute>
  );
}
